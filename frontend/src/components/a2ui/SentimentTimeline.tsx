import { TranscriptSegment } from '@/types/meeting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SentimentScore {
  label: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
}

interface SentimentTimelineProps {
  /** Transcript segments with per-segment sentiment (original MVP prop). */
  segments?: TranscriptSegment[];
  /** Aggregated sentiment scores returned from the /analyze endpoint. */
  scores?: SentimentScore[];
}

const sentimentValue: Record<string, number> = { positive: 1, neutral: 0.5, negative: 0 };
const sentimentColor: Record<string, string> = {
  positive: '#22c55e',
  neutral: '#94a3b8',
  negative: '#ef4444',
};

export default function SentimentTimeline({ segments = [], scores }: SentimentTimelineProps) {
  // Prefer aggregated scores if provided; otherwise fall back to per-segment data.
  if (scores && scores.length > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sentiment Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-24">
            {scores.map((s, i) => {
              const height = Math.max(10, ((s.score + 1) / 2) * 100);
              return (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${height}%`,
                    backgroundColor: sentimentColor[s.sentiment] ?? sentimentColor.neutral,
                    opacity: 0.85,
                  }}
                  title={`${s.label}: ${s.sentiment} (${s.score.toFixed(2)})`}
                />
              );
            })}
          </div>
          <div className="mt-2 space-y-1">
            {scores.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: sentimentColor[s.sentiment] ?? sentimentColor.neutral }}
                />
                <span className="text-muted-foreground truncate">{s.label}</span>
                <span className="ml-auto font-medium">{s.sentiment}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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
