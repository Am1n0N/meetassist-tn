/**
 * Client-side API helpers for the MeetAssist TN backend.
 * All requests go to NEXT_PUBLIC_BACKEND_URL (defaults to http://localhost:8000).
 */

import { ActionItem, Decision } from '@/types/meeting';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// ── Types ────────────────────────────────────────────────────────────────────

export interface MeetingSummary {
  id: string;
  title: string;
  created_at: string;
  status: 'recording' | 'completed';
  duration: number;
  participants: string[];
  action_items: ActionItem[];
  decisions: Decision[];
  summary: string;
  follow_up_email: string;
  transcript: unknown[];
}

export interface AnalyzeResult {
  action_items: ActionItem[];
  decisions: Decision[];
  summary: string;
  follow_up_email: string;
  sentiment_scores: { label: string; sentiment: 'positive' | 'neutral' | 'negative'; score: number }[];
}

// ── Meetings CRUD ─────────────────────────────────────────────────────────────

export async function createMeeting(id: string, title: string, participants: string[]): Promise<MeetingSummary> {
  const res = await fetch(`${BACKEND}/meetings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, title, participants }),
  });
  if (!res.ok) throw new Error(`Failed to create meeting: ${res.status}`);
  return res.json();
}

export async function listMeetings(): Promise<MeetingSummary[]> {
  const res = await fetch(`${BACKEND}/meetings`);
  if (!res.ok) throw new Error(`Failed to list meetings: ${res.status}`);
  return res.json();
}

export async function getMeeting(meetingId: string): Promise<MeetingSummary> {
  const res = await fetch(`${BACKEND}/meetings/${meetingId}`);
  if (!res.ok) throw new Error(`Failed to get meeting: ${res.status}`);
  return res.json();
}

export async function saveMeeting(
  meetingId: string,
  data: Partial<{
    status: string;
    duration: number;
    transcript: unknown[];
    action_items: ActionItem[];
    decisions: Decision[];
    summary: string;
    follow_up_email: string;
    participants: string[];
  }>
): Promise<MeetingSummary> {
  const res = await fetch(`${BACKEND}/meetings/${meetingId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to save meeting: ${res.status}`);
  return res.json();
}

// ── Analysis ─────────────────────────────────────────────────────────────────

export async function analyzeMeeting(transcript: string, participants?: string[]): Promise<AnalyzeResult> {
  const res = await fetch(`${BACKEND}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, participants }),
  });
  if (!res.ok) throw new Error(`Failed to analyze meeting: ${res.status}`);
  return res.json();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Format seconds as "1h 23m" or "45m" */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/** Format an ISO date string as a locale date */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-TN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
