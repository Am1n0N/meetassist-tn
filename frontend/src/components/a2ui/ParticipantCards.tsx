import { Participant } from '@/types/meeting';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ParticipantCardsProps {
  participants: Participant[];
  totalDuration?: number;
}

const sentimentEmoji: Record<string, string> = { positive: '😊', neutral: '😐', negative: '😟' };

export default function ParticipantCards({ participants, totalDuration = 3600 }: ParticipantCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {participants.map((p) => (
        <Card key={p.id} className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {p.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-sm">{p.name}</p>
              {p.role && <p className="text-xs text-muted-foreground">{p.role}</p>}
            </div>
            {p.sentiment && (
              <span className="ml-auto text-lg">{sentimentEmoji[p.sentiment]}</span>
            )}
          </div>
          {p.speakingTime !== undefined && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Speaking time</span>
                <span>{Math.round((p.speakingTime / totalDuration) * 100)}%</span>
              </div>
              <Progress value={(p.speakingTime / totalDuration) * 100} className="h-1.5" />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
