import { TranscriptSegment } from '@/types/meeting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TranscriptTimelineProps {
  segments: TranscriptSegment[];
  onSegmentClick?: (segment: TranscriptSegment) => void;
}

export default function TranscriptTimeline({ segments, onSegmentClick }: TranscriptTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Transcript Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-4 pl-10">
              {segments.map((seg) => (
                <div
                  key={seg.id}
                  className="relative cursor-pointer hover:bg-accent rounded p-2 transition-colors"
                  onClick={() => onSegmentClick?.(seg)}
                >
                  <div className="absolute -left-6 top-2 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(seg.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-xs font-medium">{seg.speaker}</span>
                  </div>
                  <p className="text-sm line-clamp-2">{seg.text}</p>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
