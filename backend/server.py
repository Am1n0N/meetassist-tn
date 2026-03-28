"""FastAPI server with CopilotKit endpoint for MeetAssist TN."""

import os
import json
import asyncio
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from copilotkit import CopilotKitSDK, LangGraphAgent
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

from agents.meeting_agent import graph
from agents.prompts import (
    EXTRACT_ACTIONS_PROMPT,
    EXTRACT_DECISIONS_PROMPT,
    GENERATE_SUMMARY_PROMPT,
    GENERATE_EMAIL_PROMPT,
    EXTRACT_SENTIMENT_PROMPT,
)
from utils import parse_json
from database import engine, get_db
from models import Meeting, Base
from schemas import MeetingCreate, MeetingUpdate, MeetingResponse, AnalyzeRequest, AnalyzeResponse

load_dotenv()

# Create database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="MeetAssist TN Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sdk = CopilotKitSDK(
    agents=[
        LangGraphAgent(
            name="meeting_agent",
            description="AI meeting assistant for Tunisian businesses. Analyzes meeting transcripts in Derija and French.",
            graph=graph,
        )
    ]
)

add_fastapi_endpoint(app, sdk, "/copilotkit")

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.environ.get("GROQ_API_KEY"),
    temperature=0.1,
)


def _meeting_to_response(meeting: Meeting) -> MeetingResponse:
    return MeetingResponse(
        id=meeting.id,
        title=meeting.title,
        created_at=meeting.created_at,
        status=meeting.status,
        duration=meeting.duration,
        transcript=json.loads(meeting.transcript or "[]"),
        action_items=json.loads(meeting.action_items or "[]"),
        decisions=json.loads(meeting.decisions or "[]"),
        participants=json.loads(meeting.participants or "[]"),
        summary=meeting.summary or "",
        follow_up_email=meeting.follow_up_email or "",
    )


# ── Health ──────────────────────────────────────────────────────────────────


@app.get("/health")
async def health():
    return {"status": "ok", "service": "MeetAssist TN Backend"}


# ── Meetings CRUD ────────────────────────────────────────────────────────────


@app.post("/meetings", response_model=MeetingResponse, status_code=201)
def create_meeting(body: MeetingCreate, db: Session = Depends(get_db)):
    meeting = Meeting(
        id=body.id,
        title=body.title,
        participants=json.dumps(body.participants or []),
    )
    db.add(meeting)
    db.commit()
    db.refresh(meeting)
    return _meeting_to_response(meeting)


@app.get("/meetings", response_model=list[MeetingResponse])
def list_meetings(db: Session = Depends(get_db)):
    meetings = db.query(Meeting).order_by(Meeting.created_at.desc()).all()
    return [_meeting_to_response(m) for m in meetings]


@app.get("/meetings/{meeting_id}", response_model=MeetingResponse)
def get_meeting(meeting_id: str, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return _meeting_to_response(meeting)


@app.put("/meetings/{meeting_id}", response_model=MeetingResponse)
def update_meeting(meeting_id: str, body: MeetingUpdate, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    if body.status is not None:
        meeting.status = body.status
    if body.duration is not None:
        meeting.duration = body.duration
    if body.transcript is not None:
        meeting.transcript = json.dumps(body.transcript)
    if body.action_items is not None:
        meeting.action_items = json.dumps(body.action_items)
    if body.decisions is not None:
        meeting.decisions = json.dumps(body.decisions)
    if body.summary is not None:
        meeting.summary = body.summary
    if body.follow_up_email is not None:
        meeting.follow_up_email = body.follow_up_email
    if body.participants is not None:
        meeting.participants = json.dumps(body.participants)
    db.commit()
    db.refresh(meeting)
    return _meeting_to_response(meeting)


# ── Analyze endpoint ─────────────────────────────────────────────────────────


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_transcript(body: AnalyzeRequest):
    """Analyze a meeting transcript: extract action items, decisions, summary,
    follow-up email, and sentiment scores — all in parallel."""
    transcript = body.transcript
    if not transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript is empty")

    action_task = llm.ainvoke([HumanMessage(content=EXTRACT_ACTIONS_PROMPT.format(transcript=transcript))])
    decision_task = llm.ainvoke([HumanMessage(content=EXTRACT_DECISIONS_PROMPT.format(transcript=transcript))])
    summary_task = llm.ainvoke([HumanMessage(content=GENERATE_SUMMARY_PROMPT.format(transcript=transcript))])
    sentiment_task = llm.ainvoke([HumanMessage(content=EXTRACT_SENTIMENT_PROMPT.format(transcript=transcript))])

    action_res, decision_res, summary_res, sentiment_res = await asyncio.gather(
        action_task, decision_task, summary_task, sentiment_task
    )

    action_items = parse_json(action_res.content, [])
    decisions = parse_json(decision_res.content, [])
    sentiment_scores = parse_json(sentiment_res.content, [])
    summary = summary_res.content if hasattr(summary_res, "content") else ""

    # Ensure required fields
    for i, item in enumerate(action_items):
        item.setdefault("id", f"a{i+1}")
        item.setdefault("status", "todo")
        item.setdefault("priority", "medium")
    for i, dec in enumerate(decisions):
        dec.setdefault("id", f"d{i+1}")
        dec.setdefault("timestamp", 0)
        dec.setdefault("participants", [])

    # Generate follow-up email using the extracted data
    email_res = await llm.ainvoke(
        [HumanMessage(content=GENERATE_EMAIL_PROMPT.format(
            summary=summary,
            action_items=json.dumps(action_items, ensure_ascii=False),
            decisions=json.dumps(decisions, ensure_ascii=False),
        ))]
    )
    follow_up_email = email_res.content if hasattr(email_res, "content") else ""

    return AnalyzeResponse(
        action_items=action_items,
        decisions=decisions,
        summary=summary,
        follow_up_email=follow_up_email,
        sentiment_scores=sentiment_scores,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
