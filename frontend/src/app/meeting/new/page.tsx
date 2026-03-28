'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, FileText, Users, Loader2 } from 'lucide-react';
import { createMeeting } from '@/lib/api';

export default function NewMeetingPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [participantsInput, setParticipantsInput] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const id = Date.now().toString();
      const meetingTitle = title.trim() || 'New Meeting';
      const participants = participantsInput
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      // Persist meeting in backend (best-effort; proceed even if backend is down)
      await createMeeting(id, meetingTitle, participants).catch(console.error);

      const params = new URLSearchParams({ title: meetingTitle });
      if (participants.length > 0) params.set('participants', participants.join(','));
      router.push(`/meeting/${id}?${params.toString()}`);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Mic className="w-6 h-6 text-blue-500" /> Start New Meeting
          </CardTitle>
          <CardDescription>Configure your meeting settings before recording</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Meeting Title</label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Q3 Strategy Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-1">
              <Users className="w-4 h-4" /> Participants
              <span className="font-normal text-muted-foreground">(optional, comma-separated)</span>
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Amine, Rania, Karim"
              value={participantsInput}
              onChange={(e) => setParticipantsInput(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Mic className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-sm">Audio Recording</span>
              </div>
              <p className="text-xs text-gray-600">Browser-based Web Audio API recording</p>
            </Card>
            <Card className="p-4 bg-purple-50 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-purple-500" />
                <span className="font-medium text-sm">AI Transcription</span>
              </div>
              <p className="text-xs text-gray-600">Groq Whisper — Derija + French</p>
            </Card>
          </div>

          <Button onClick={handleStart} className="w-full gap-2" size="lg" disabled={isStarting}>
            {isStarting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Starting…</>
            ) : (
              <><Mic className="w-5 h-5" /> Start Recording</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
