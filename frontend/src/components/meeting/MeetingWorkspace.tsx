'use client';

import { useState } from 'react';
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';
import { CopilotPopup } from '@copilotkit/react-ui';
import AudioRecorder from './AudioRecorder';
import TranscriptView from './TranscriptView';
import MeetingControls from './MeetingControls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TranscriptSegment, ActionItem, Decision } from '@/types/meeting';
import ActionItemKanban from '@/components/a2ui/ActionItemKanban';
import SummaryAccordion from '@/components/a2ui/SummaryAccordion';
import DecisionCard from '@/components/a2ui/DecisionCard';
import StatusDashboard from '@/components/a2ui/StatusDashboard';
import DynamicGrid from '@/components/a2ui/DynamicGrid';

interface MeetingWorkspaceProps {
  meetingId: string;
  meetingTitle: string;
}

export default function MeetingWorkspace({ meetingId, meetingTitle }: MeetingWorkspaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [summary, setSummary] = useState('');

  useCopilotReadable({
    description: 'Current meeting transcript',
    value: transcript,
  });

  useCopilotReadable({
    description: 'Current action items',
    value: actionItems,
  });

  useCopilotAction({
    name: 'generateMeetingDashboard',
    description: 'Generate a dynamic A2UI dashboard from meeting data',
    parameters: [
      { name: 'actionItems', type: 'object[]', description: 'List of action items' },
      { name: 'decisions', type: 'object[]', description: 'List of decisions made' },
      { name: 'summary', type: 'string', description: 'Meeting summary' },
      { name: 'participants', type: 'object[]', description: 'Meeting participants' },
    ],
    render: ({ status, args }) => {
      if (status === 'inProgress') {
        return <div className="animate-pulse p-4 text-center">Generating dashboard...</div>;
      }
      return (
        <DynamicGrid>
          {args.actionItems && <ActionItemKanban items={args.actionItems as ActionItem[]} />}
          {args.decisions && (args.decisions as Decision[]).map((d, i) => (
            <DecisionCard key={i} decision={d} />
          ))}
          {args.summary && <SummaryAccordion summary={args.summary as string} />}
          {args.actionItems && (
            <StatusDashboard
              stats={[
                { label: 'Total Actions', value: (args.actionItems as ActionItem[]).length, color: 'blue' },
                { label: 'Decisions', value: (args.decisions as Decision[])?.length || 0, color: 'green' },
              ]}
            />
          )}
        </DynamicGrid>
      );
    },
    handler: async ({ actionItems: ai, decisions: d, summary: s }) => {
      setActionItems(ai as ActionItem[]);
      setDecisions(d as Decision[]);
      setSummary(s as string);
    },
  });

  const handleTranscriptUpdate = (segment: TranscriptSegment) => {
    setTranscript((prev) => [...prev, segment]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{meetingTitle}</h1>
            <p className="text-muted-foreground text-sm">Meeting ID: {meetingId}</p>
          </div>
          <Badge variant={isRecording ? 'destructive' : 'secondary'}>
            {isRecording ? '🔴 Recording' : 'Idle'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <MeetingControls
              isRecording={isRecording}
              onToggleRecording={() => setIsRecording((r) => !r)}
            />
            <AudioRecorder
              isRecording={isRecording}
              onTranscriptUpdate={handleTranscriptUpdate}
            />
          </div>

          <div className="lg:col-span-2">
            <Tabs defaultValue="transcript">
              <TabsList className="mb-4">
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="actions">Action Items</TabsTrigger>
                <TabsTrigger value="dashboard">A2UI Dashboard</TabsTrigger>
              </TabsList>
              <TabsContent value="transcript">
                <TranscriptView segments={transcript} />
              </TabsContent>
              <TabsContent value="actions">
                <ActionItemKanban items={actionItems} />
              </TabsContent>
              <TabsContent value="dashboard">
                {actionItems.length === 0 && decisions.length === 0 && !summary ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Ask the AI assistant to generate a dashboard from your meeting data.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <DynamicGrid>
                    <ActionItemKanban items={actionItems} />
                    {decisions.map((d, i) => <DecisionCard key={i} decision={d} />)}
                    {summary && <SummaryAccordion summary={summary} />}
                  </DynamicGrid>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <CopilotPopup
        instructions="You are MeetAssist TN, an AI assistant for Tunisian business meetings. Help analyze meeting transcripts in Derija and French, extract action items, decisions, and generate rich A2UI dashboards."
        labels={{
          title: 'MeetAssist AI',
          initial: 'How can I help with your meeting?',
        }}
      />
    </div>
  );
}
