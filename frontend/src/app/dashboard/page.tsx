'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Clock, Users, ArrowRight, RefreshCw } from 'lucide-react';
import { listMeetings, formatDuration, formatDate, MeetingSummary } from '@/lib/api';

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<MeetingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMeetings();
      setMeetings(data);
    } catch {
      setError('Could not connect to backend. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Meeting Dashboard</h1>
          <p className="text-muted-foreground">View and manage your meeting recordings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchMeetings} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          <Link href="/meeting/new">
            <Button className="gap-2">
              <Mic className="w-4 h-4" /> New Meeting
            </Button>
          </Link>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-muted-foreground">Loading meetings…</div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm mb-4">
          {error}
        </div>
      )}

      {!loading && !error && meetings.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="mb-4">No meetings recorded yet.</p>
          <Link href="/meeting/new">
            <Button className="gap-2">
              <Mic className="w-4 h-4" /> Start your first meeting
            </Button>
          </Link>
        </div>
      )}

      <div className="grid gap-4">
        {meetings.map((meeting) => (
          <Card key={meeting.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{meeting.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(meeting.duration)}
                    </span>
                    {meeting.participants.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span>{formatDate(meeting.created_at)}</span>
                    {meeting.action_items.length > 0 && (
                      <span className="text-blue-600">{meeting.action_items.length} actions</span>
                    )}
                  </CardDescription>
                  {meeting.summary && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 max-w-xl">
                      {meeting.summary}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={meeting.status === 'completed' ? 'secondary' : 'destructive'}>
                    {meeting.status}
                  </Badge>
                  <Link href={`/meeting/${meeting.id}?title=${encodeURIComponent(meeting.title)}`}>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
