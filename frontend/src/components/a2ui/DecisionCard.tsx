import { Decision } from '@/types/meeting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface DecisionCardProps {
  decision: Decision;
}

export default function DecisionCard({ decision }: DecisionCardProps) {
  return (
    <Card className="border-l-4 border-l-green-500 bg-green-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-green-700">
          <CheckCircle2 className="w-4 h-4" /> Decision Made
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-medium text-sm">{decision.text}</p>
        {decision.context && (
          <p className="text-xs text-muted-foreground mt-2 italic">Context: {decision.context}</p>
        )}
        {decision.participants?.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Participants: {decision.participants.join(', ')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
