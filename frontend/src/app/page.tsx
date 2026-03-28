import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Brain, FileText, Users } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="secondary">🇹🇳 Tunisia-First</Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            MeetAssist <span className="text-blue-600">TN</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            AI-powered meeting assistant for Tunisian businesses. Transcribes Derija & French,
            generates smart summaries, and builds interactive dashboards — automatically.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/meeting/new">
              <Button size="lg" className="gap-2">
                <Mic className="w-5 h-5" /> Start New Meeting
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="gap-2">
                <FileText className="w-5 h-5" /> View Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Mic className="w-8 h-8 text-blue-500 mb-2" />
              <CardTitle>Live Recording</CardTitle>
              <CardDescription>Record meetings in browser with Web Audio API</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Brain className="w-8 h-8 text-purple-500 mb-2" />
              <CardTitle>Bilingual AI</CardTitle>
              <CardDescription>Understands Tunisian Derija and French seamlessly</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <FileText className="w-8 h-8 text-green-500 mb-2" />
              <CardTitle>Smart Summaries</CardTitle>
              <CardDescription>Auto-generates action items, decisions, and follow-ups</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Users className="w-8 h-8 text-orange-500 mb-2" />
              <CardTitle>A2UI Dashboards</CardTitle>
              <CardDescription>AI composes rich interactive UI components dynamically</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </main>
  );
}
