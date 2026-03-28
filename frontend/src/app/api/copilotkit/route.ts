import { NextRequest } from 'next/server';
import { CopilotRuntime, GroqAdapter, copilotRuntimeNextJSAppRouterEndpoint } from '@copilotkit/runtime';

const runtime = new CopilotRuntime({
  remoteActions: [
    {
      url: process.env.NEXT_PUBLIC_COPILOTKIT_URL || 'http://localhost:8000/copilotkit',
    },
  ],
});

const serviceAdapter = new GroqAdapter({
  model: 'llama-3.3-70b-versatile',
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/copilotkit',
  });
  return handleRequest(req);
};
