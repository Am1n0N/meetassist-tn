"""Pydantic schemas for MeetAssist TN API."""

from pydantic import BaseModel
from typing import Any, List, Optional
from datetime import datetime


class MeetingCreate(BaseModel):
    id: str
    title: str
    participants: Optional[List[str]] = []


class MeetingUpdate(BaseModel):
    status: Optional[str] = None
    duration: Optional[int] = None
    transcript: Optional[List[Any]] = None
    action_items: Optional[List[Any]] = None
    decisions: Optional[List[Any]] = None
    summary: Optional[str] = None
    follow_up_email: Optional[str] = None
    participants: Optional[List[str]] = None


class MeetingResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    status: str
    duration: int
    transcript: List[Any]
    action_items: List[Any]
    decisions: List[Any]
    participants: List[str]
    summary: str
    follow_up_email: str

    class Config:
        from_attributes = True


class AnalyzeRequest(BaseModel):
    transcript: str
    participants: Optional[List[str]] = []


class AnalyzeResponse(BaseModel):
    action_items: List[Any]
    decisions: List[Any]
    summary: str
    follow_up_email: str
    sentiment_scores: List[Any]
