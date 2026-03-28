import { TranscriptSegment } from '@/types/meeting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SentimentTimelineProps {
  segments: TranscriptSegment[];
}

const sentimentValue: Record<string, number> = { positive: 1, neutral: 0.5, negative: 0 };
const sentimentColor: Record<string, string> = {
  positive: '#22c55e',
  neutral: '#94a3b8',
  negative: '#ef4444',
};

export default function SentimentTimeline({ segments }: SentimentTimelineProps) {
  const withSentiment = segments.filter((s) => s.sentiment);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Sentiment Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {withSentiment.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Sentiment analysis will appear here after transcription.
          </p>
        ) : (
          <div className="flex items-end gap-1 h-24">
            {withSentiment.map((seg) => {
              const value = sentimentValue[seg.sentiment || 'neutral'];
              return (
                <div
                  key={seg.id}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${Math.max(10, value * 100)}%`,
                    backgroundColor: sentimentColor[seg.sentiment || 'neutral'],
                    opacity: 0.8,
                  }}
                  title={`${seg.speaker}: ${seg.sentiment}`}
                />
              );
            })}
          </div>
        )}
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>😊 Positive</span>
          <span>😐 Neutral</span>
          <span>😟 Negative</span>
        </div>
      </CardContent>
    </Card>
  );
}
