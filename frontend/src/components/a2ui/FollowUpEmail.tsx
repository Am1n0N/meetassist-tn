'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Copy, Check } from 'lucide-react';

interface FollowUpEmailProps {
  to?: string[];
  subject?: string;
  body?: string;
}

export default function FollowUpEmail({ to = [], subject = '', body = '' }: FollowUpEmailProps) {
  const [copied, setCopied] = useState(false);

  const emailContent = `To: ${to.join(', ')}\nSubject: ${subject}\n\n${body}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(emailContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Mail className="w-4 h-4" /> Follow-Up Email Draft
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm space-y-2">
          <div><span className="font-bold text-muted-foreground">To:</span> {to.join(', ') || '(recipients)'}</div>
          <div><span className="font-bold text-muted-foreground">Subject:</span> {subject || '(subject)'}</div>
          <hr className="border-gray-200" />
          <pre className="whitespace-pre-wrap text-xs">{body || '(email body will appear here after AI generation)'}</pre>
        </div>
        <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={handleCopy}>
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy Email'}
        </Button>
      </CardContent>
    </Card>
  );
}
