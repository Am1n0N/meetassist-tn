'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
import FollowUpEmail from '@/components/a2ui/FollowUpEmail';
import SentimentTimeline from '@/components/a2ui/SentimentTimeline';
import DynamicGrid from '@/components/a2ui/DynamicGrid';
import { analyzeMeeting, saveMeeting, AnalyzeResult } from '@/lib/api';

interface MeetingWorkspaceProps {
  meetingId: string;
  meetingTitle: string;
  initialParticipants?: string[];
}

export default function MeetingWorkspace({ meetingId, meetingTitle, initialParticipants = [] }: MeetingWorkspaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [summary, setSummary] = useState('');
  const [followUpEmail, setFollowUpEmail] = useState('');
  const [sentimentScores, setSentimentScores] = useState<{ label: string; sentiment: 'positive' | 'neutral' | 'negative'; score: number }[]>([]);
  const [activeTab, setActiveTab] = useState('transcript');
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

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

  const handleToggleRecording = async () => {
    if (isRecording) {
      const durationSecs = Math.round((Date.now() - startTimeRef.current) / 1000);
      await saveMeeting(meetingId, {
        status: 'completed',
        duration: durationSecs,
        transcript,
        participants: initialParticipants,
      }).catch(console.error);
    }
    setIsRecording((r) => !r);
  };

  const handleGenerateSummary = useCallback(async () => {
    const transcriptText = transcript.map((s) => `${s.speaker}: ${s.text}`).join('\n');
    if (!transcriptText.trim()) return;

    setIsAnalyzing(true);
    try {
      const result: AnalyzeResult = await analyzeMeeting(transcriptText, initialParticipants);
      setActionItems(result.action_items);
      setDecisions(result.decisions);
      setSummary(result.summary);
      setFollowUpEmail(result.follow_up_email);
      setSentimentScores(result.sentiment_scores);

      await saveMeeting(meetingId, {
        action_items: result.action_items,
        decisions: result.decisions,
        summary: result.summary,
        follow_up_email: result.follow_up_email,
      }).catch(console.error);

      setActiveTab('dashboard');
    } catch (err) {
      console.error('Analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [transcript, meetingId, initialParticipants]);

  const handleExportTranscript = useCallback(() => {
    const lines: string[] = [
      `# ${meetingTitle}`,
      `Meeting ID: ${meetingId}`,
      `Date: ${new Date().toLocaleString('fr-TN')}`,
      '',
      '## Transcript',
      '',
    ];

    transcript.forEach((seg) => {
      const time = new Date(seg.timestamp).toLocaleTimeString('fr-TN');
      lines.push(`**[${time}] ${seg.speaker}** (${seg.language}): ${seg.text}`);
    });

    if (summary) {
      lines.push('', '## Summary', '', summary);
    }

    if (actionItems.length > 0) {
      lines.push('', '## Action Items', '');
      actionItems.forEach((item) => {
        lines.push(`- [${item.status === 'done' ? 'x' : ' '}] **${item.title}** (${item.priority})${item.assignee ? ` — ${item.assignee}` : ''}${item.deadline ? ` — Due: ${item.deadline}` : ''}`);
      });
    }

    if (decisions.length > 0) {
      lines.push('', '## Decisions', '');
      decisions.forEach((dec) => {
        lines.push(`- ${dec.text}`);
        if (dec.context) lines.push(`  > ${dec.context}`);
      });
    }

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meetingTitle.replace(/\s+/g, '-')}-${meetingId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [meetingId, meetingTitle, transcript, summary, actionItems, decisions]);

  const hasDashboardData = actionItems.length > 0 || decisions.length > 0 || !!summary;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{meetingTitle}</h1>
            <p className="text-muted-foreground text-sm">Meeting ID: {meetingId}</p>
            {initialParticipants.length > 0 && (
              <p className="text-muted-foreground text-xs mt-0.5">
                Participants: {initialParticipants.join(', ')}
              </p>
            )}
          </div>
          <Badge variant={isRecording ? 'destructive' : 'secondary'}>
            {isRecording ? '🔴 Recording' : 'Idle'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <MeetingControls
              isRecording={isRecording}
              isAnalyzing={isAnalyzing}
              onToggleRecording={handleToggleRecording}
              onGenerateSummary={handleGenerateSummary}
              onExportTranscript={handleExportTranscript}
            />
            <AudioRecorder
              isRecording={isRecording}
              onTranscriptUpdate={handleTranscriptUpdate}
            />
          </div>

          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="actions">Action Items</TabsTrigger>
                <TabsTrigger value="dashboard">A2UI Dashboard</TabsTrigger>
                {followUpEmail && <TabsTrigger value="email">Follow-up Email</TabsTrigger>}
              </TabsList>
              <TabsContent value="transcript">
                <TranscriptView segments={transcript} />
              </TabsContent>
              <TabsContent value="actions">
                <ActionItemKanban items={actionItems} />
              </TabsContent>
              <TabsContent value="dashboard">
                {!hasDashboardData ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Dashboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Click <strong>Generate Summary</strong> or ask the AI assistant to analyze your meeting transcript.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <DynamicGrid>
                    <ActionItemKanban items={actionItems} />
                    {decisions.map((d, i) => <DecisionCard key={i} decision={d} />)}
                    {summary && <SummaryAccordion summary={summary} />}
                    {actionItems.length > 0 && (
                      <StatusDashboard
                        stats={[
                          { label: 'Total Actions', value: actionItems.length, color: 'blue' },
                          { label: 'Decisions', value: decisions.length, color: 'green' },
                          { label: 'High Priority', value: actionItems.filter(a => a.priority === 'high').length, color: 'red' },
                          { label: 'Completed', value: actionItems.filter(a => a.status === 'done').length, color: 'green' },
                        ]}
                      />
                    )}
                    {sentimentScores.length > 0 && (
                      <SentimentTimeline scores={sentimentScores} />
                    )}
                  </DynamicGrid>
                )}
              </TabsContent>
              {followUpEmail && (
                <TabsContent value="email">
                  <FollowUpEmail content={followUpEmail} />
                </TabsContent>
              )}
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
