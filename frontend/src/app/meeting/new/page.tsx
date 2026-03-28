'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, FileText } from 'lucide-react';

export default function NewMeetingPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');

  const handleStart = () => {
    const id = Date.now().toString();
    router.push(`/meeting/${id}?title=${encodeURIComponent(title || 'New Meeting')}`);
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

          <Button onClick={handleStart} className="w-full gap-2" size="lg">
            <Mic className="w-5 h-5" /> Start Recording
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
