'use client';

import { useEffect, useRef } from 'react';
import { TranscriptSegment } from '@/types/meeting';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TranscriptViewProps {
  segments: TranscriptSegment[];
}

const languageLabel: Record<string, string> = { ar: 'Derija', fr: 'French', mixed: 'Mixed' };
const sentimentColor: Record<string, string> = {
  positive: 'bg-green-100 text-green-800',
  neutral: 'bg-gray-100 text-gray-800',
  negative: 'bg-red-100 text-red-800',
};

export default function TranscriptView({ segments }: TranscriptViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [segments]);

  return (
    <Card className="h-[500px]">
      <CardHeader>
        <CardTitle className="text-sm">Live Transcript</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[420px] px-6">
          {segments.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              Transcript will appear here as you record...
            </p>
          ) : (
            <div className="space-y-3 pb-4">
              {segments.map((seg) => (
                <div key={seg.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-16 text-xs text-muted-foreground pt-1">
                    {new Date(seg.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{seg.speaker}</span>
                      <Badge variant="outline" className="text-xs py-0">
                        {languageLabel[seg.language] || seg.language}
                      </Badge>
                      {seg.sentiment && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${sentimentColor[seg.sentiment]}`}>
                          {seg.sentiment}
                        </span>
                      )}
                    </div>
                    <p className="text-sm">{seg.text}</p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
