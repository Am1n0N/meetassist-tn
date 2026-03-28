"""FastAPI server with CopilotKit endpoint for MeetAssist TN."""

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from copilotkit.integrations.fastapi import add_fastapi_endpoint
from copilotkit import CopilotKitSDK, LangGraphAgent
from agents.meeting_agent import graph

load_dotenv()

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


@app.get("/health")
async def health():
    return {"status": "ok", "service": "MeetAssist TN Backend"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
