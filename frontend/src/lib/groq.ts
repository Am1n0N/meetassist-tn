import Groq from 'groq-sdk';

export const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
  const transcription = await groqClient.audio.transcriptions.create({
    file,
    model: 'whisper-large-v3-turbo',
    language: 'ar',
    response_format: 'text',
  });
  // The SDK returns a string when response_format is 'text', but types it as Transcription
  return typeof transcription === 'string' ? transcription : (transcription as { text: string }).text;
}
