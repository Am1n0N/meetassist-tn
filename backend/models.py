"""SQLAlchemy models for MeetAssist TN."""

from sqlalchemy import Column, String, Integer, Text, DateTime
from datetime import datetime, timezone
from .database import Base


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String, default="recording")  # recording | completed
    duration = Column(Integer, default=0)  # seconds

    # JSON-encoded arrays / strings
    transcript = Column(Text, default="[]")       # List[TranscriptSegment]
    action_items = Column(Text, default="[]")     # List[ActionItem]
    decisions = Column(Text, default="[]")        # List[Decision]
    participants = Column(Text, default="[]")     # List[str]
    summary = Column(Text, default="")
    follow_up_email = Column(Text, default="")
