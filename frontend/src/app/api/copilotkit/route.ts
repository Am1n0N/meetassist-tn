import { NextRequest } from 'next/server';
import { CopilotRuntime, GroqAdapter, copilotRuntimeNextJSAppRouterEndpoint } from '@copilotkit/runtime';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const runtime = new CopilotRuntime({
  remoteActions: [
    {
      url: process.env.NEXT_PUBLIC_COPILOTKIT_URL || 'http://localhost:8000/copilotkit',
    },
  ],
});

const serviceAdapter = new GroqAdapter({
  groq,
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
