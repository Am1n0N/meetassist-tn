'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import MeetingWorkspace from '@/components/meeting/MeetingWorkspace';

function MeetingPageContent({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const title = searchParams.get('title') || 'Meeting';
  return <MeetingWorkspace meetingId={params.id} meetingTitle={title} />;
}

export default function MeetingPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <MeetingPageContent params={params} />
    </Suspense>
  );
}
