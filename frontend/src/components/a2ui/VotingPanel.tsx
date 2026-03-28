'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface VoteOption {
  id: string;
  label: string;
  votes: number;
}

interface VotingPanelProps {
  question: string;
  options: VoteOption[];
  onVote?: (optionId: string) => void;
}

export default function VotingPanel({ question, options: initialOptions, onVote }: VotingPanelProps) {
  const [options, setOptions] = useState(initialOptions);
  const [voted, setVoted] = useState<string | null>(null);

  const totalVotes = options.reduce((sum, o) => sum + o.votes, 0);

  const handleVote = (optionId: string) => {
    if (voted) return;
    setVoted(optionId);
    setOptions((prev) =>
      prev.map((o) => (o.id === optionId ? { ...o, votes: o.votes + 1 } : o))
    );
    onVote?.(optionId);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">🗳️ {question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {options.map((option) => {
          const pct = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
          return (
            <div key={option.id}>
              <div className="flex justify-between items-center mb-1">
                <Button
                  variant={voted === option.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleVote(option.id)}
                  disabled={!!voted && voted !== option.id}
                  className="text-xs"
                >
                  {option.label}
                </Button>
                <span className="text-xs text-muted-foreground">{option.votes} votes ({pct}%)</span>
              </div>
              <Progress value={pct} className="h-1.5" />
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground text-right">Total: {totalVotes} votes</p>
      </CardContent>
    </Card>
  );
}
