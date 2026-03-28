'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Clock, Users, ArrowRight } from 'lucide-react';

const mockMeetings = [
  { id: '1', title: 'Q3 Strategy Review', date: '2024-07-15', duration: '1h 23m', participants: 5, status: 'completed' },
  { id: '2', title: 'Product Roadmap Planning', date: '2024-07-14', duration: '45m', participants: 3, status: 'completed' },
  { id: '3', title: 'Client Presentation Prep', date: '2024-07-13', duration: '32m', participants: 4, status: 'completed' },
];

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Meeting Dashboard</h1>
          <p className="text-muted-foreground">View and manage your meeting recordings</p>
        </div>
        <Link href="/meeting/new">
          <Button className="gap-2">
            <Mic className="w-4 h-4" /> New Meeting
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {mockMeetings.map((meeting) => (
          <Card key={meeting.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{meeting.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{meeting.duration}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{meeting.participants} participants</span>
                    <span>{meeting.date}</span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{meeting.status}</Badge>
                  <Link href={`/meeting/${meeting.id}`}>
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
