'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mic, Square, Download, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface MeetingControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
}

export default function MeetingControls({ isRecording, onToggleRecording }: MeetingControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={onToggleRecording}
          variant={isRecording ? 'destructive' : 'default'}
          className="w-full gap-2"
        >
          {isRecording ? (
            <><Square className="w-4 h-4" /> Stop Recording</>
          ) : (
            <><Mic className="w-4 h-4" /> Start Recording</>
          )}
        </Button>
        <Separator />
        <Button variant="outline" className="w-full gap-2" size="sm">
          <Sparkles className="w-4 h-4" /> Generate Summary
        </Button>
        <Button variant="outline" className="w-full gap-2" size="sm">
          <Download className="w-4 h-4" /> Export Transcript
        </Button>
        <Link href="/dashboard" className="block">
          <Button variant="ghost" className="w-full" size="sm">Back to Dashboard</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
