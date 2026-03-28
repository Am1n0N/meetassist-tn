"""LangGraph meeting agent for MeetAssist TN."""

import os
import json
from typing import Annotated, TypedDict, List, Any
from langchain_groq import ChatGroq
from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from copilotkit.langchain import copilotkit_customize_config, copilotkit_emit_state
from .prompts import SYSTEM_PROMPT, EXTRACT_ACTIONS_PROMPT, EXTRACT_DECISIONS_PROMPT, GENERATE_SUMMARY_PROMPT

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

    # Extract action items
    action_response = await llm.ainvoke(
        [HumanMessage(content=EXTRACT_ACTIONS_PROMPT.format(transcript=transcript))]
    )
    try:
        action_items = json.loads(action_response.content)
    except (json.JSONDecodeError, AttributeError) as e:
        print(f"[meeting_agent] Failed to parse action items JSON: {e}")
        action_items = []

    # Extract decisions
    decision_response = await llm.ainvoke(
        [HumanMessage(content=EXTRACT_DECISIONS_PROMPT.format(transcript=transcript))]
    )
    try:
        decisions = json.loads(decision_response.content)
    except (json.JSONDecodeError, AttributeError) as e:
        print(f"[meeting_agent] Failed to parse decisions JSON: {e}")
        decisions = []

    # Generate summary
    summary_response = await llm.ainvoke(
        [HumanMessage(content=GENERATE_SUMMARY_PROMPT.format(transcript=transcript))]
    )
    summary = summary_response.content if hasattr(summary_response, "content") else ""

    updated_state = {
        **state,
        "action_items": action_items,
        "decisions": decisions,
        "summary": summary,
    }

    await copilotkit_emit_state(config, updated_state)
    return updated_state


def should_analyze(state: MeetingAgentState) -> str:
    """Decide whether to analyze transcript based on latest message."""
    messages = state.get("messages", [])
    if not messages:
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
workflow.add_edge("analyze", "chat")
workflow.add_edge("chat", END)

graph = workflow.compile()
