export interface TranscriptSegment {
  id: string;
  speaker: string;
  text: string;
  timestamp: number;
  language: 'ar' | 'fr' | 'mixed';
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface ActionItem {
  id: string;
  title: string;
  assignee?: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
}

export interface Decision {
  id: string;
  text: string;
  context: string;
  timestamp: number;
  participants: string[];
}

export interface Participant {
  id: string;
  name: string;
  role?: string;
  speakingTime?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: number;
  participants: Participant[];
  transcript: TranscriptSegment[];
  actionItems: ActionItem[];
  decisions: Decision[];
  summary?: string;
  followUpEmail?: string;
}

export interface MeetingState {
  status: 'idle' | 'recording' | 'processing' | 'complete';
  meeting: Meeting | null;
  currentTranscript: TranscriptSegment[];
}
