"""LangGraph meeting agent for MeetAssist TN."""

import os
import asyncio
from typing import Annotated, TypedDict, List, Any
from langchain_groq import ChatGroq
from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from copilotkit.langchain import copilotkit_customize_config, copilotkit_emit_state
from .prompts import (
    SYSTEM_PROMPT,
    EXTRACT_ACTIONS_PROMPT,
    EXTRACT_DECISIONS_PROMPT,
    GENERATE_SUMMARY_PROMPT,
    EXTRACT_SENTIMENT_PROMPT,
)
from .utils import parse_json

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.environ.get("GROQ_API_KEY"),
    temperature=0.1,
)


class MeetingAgentState(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]
    transcript: str
    action_items: List[Any]
    decisions: List[Any]
    summary: str
    participants: List[Any]
    sentiment_scores: List[Any]


async def chat_node(state: MeetingAgentState, config: Any) -> MeetingAgentState:
    """Main chat node — handles user messages and tool calls."""
    config = copilotkit_customize_config(
        config,
        emit_intermediate_state=[
            {"state_key": "action_items", "tool": "generateMeetingDashboard", "tool_argument": "actionItems"},
            {"state_key": "decisions", "tool": "generateMeetingDashboard", "tool_argument": "decisions"},
            {"state_key": "summary", "tool": "generateMeetingDashboard", "tool_argument": "summary"},
        ],
    )

    system = SystemMessage(content=SYSTEM_PROMPT)
    messages = [system] + state["messages"]

    response = await llm.ainvoke(messages, config=config)

    return {
        **state,
        "messages": [response],
    }


async def analyze_transcript_node(state: MeetingAgentState, config: Any) -> MeetingAgentState:
    """Analyzes transcript to extract structured data."""
    transcript = state.get("transcript", "")
    if not transcript:
        return state

    # Run all extractions concurrently
    action_task = llm.ainvoke([HumanMessage(content=EXTRACT_ACTIONS_PROMPT.format(transcript=transcript))])
    decision_task = llm.ainvoke([HumanMessage(content=EXTRACT_DECISIONS_PROMPT.format(transcript=transcript))])
    summary_task = llm.ainvoke([HumanMessage(content=GENERATE_SUMMARY_PROMPT.format(transcript=transcript))])
    sentiment_task = llm.ainvoke([HumanMessage(content=EXTRACT_SENTIMENT_PROMPT.format(transcript=transcript))])

    action_response, decision_response, summary_response, sentiment_response = await asyncio.gather(
        action_task, decision_task, summary_task, sentiment_task
    )

    action_items = parse_json(action_response.content, [])
    decisions = parse_json(decision_response.content, [])
    sentiment_scores = parse_json(sentiment_response.content, [])
    summary = summary_response.content if hasattr(summary_response, "content") else ""

    # Ensure action items have required fields
    for i, item in enumerate(action_items):
        item.setdefault("id", f"a{i+1}")
        item.setdefault("status", "todo")
        item.setdefault("priority", "medium")

    # Ensure decisions have required fields
    for i, dec in enumerate(decisions):
        dec.setdefault("id", f"d{i+1}")
        dec.setdefault("timestamp", 0)
        dec.setdefault("participants", [])

    updated_state = {
        **state,
        "action_items": action_items,
        "decisions": decisions,
        "summary": summary,
        "sentiment_scores": sentiment_scores,
    }

    await copilotkit_emit_state(config, updated_state)
    return updated_state


def should_analyze(state: MeetingAgentState) -> str:
    """Decide whether to analyze transcript based on latest message."""
    messages = state.get("messages", [])
    if not messages:
        return "chat"
    # Don't re-analyze if we already have results from a previous run
    if state.get("action_items") or state.get("decisions"):
        return "chat"
    last_msg = messages[-1]
    content = getattr(last_msg, "content", "")
    if isinstance(content, str) and ("analyze" in content.lower() or "transcript" in content.lower()):
        return "analyze"
    return "chat"


# Build the graph
workflow = StateGraph(MeetingAgentState)
workflow.add_node("chat", chat_node)
workflow.add_node("analyze", analyze_transcript_node)
workflow.set_entry_point("chat")
workflow.add_conditional_edges("chat", should_analyze, {"analyze": "analyze", "chat": END})
workflow.add_edge("analyze", "chat")

graph = workflow.compile()
