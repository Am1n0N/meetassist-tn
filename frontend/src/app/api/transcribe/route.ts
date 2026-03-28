import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get('audio');

    if (!audio || !(audio instanceof File)) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const transcription = await groq.audio.transcriptions.create({
      file: audio,
      model: 'whisper-large-v3-turbo',
      response_format: 'verbose_json',
    });

    // Map Whisper ISO 639-1 language codes to our internal codes
    const rawLang = (transcription as { language?: string }).language ?? '';
    let language: 'ar' | 'fr' | 'mixed' = 'mixed';
    if (rawLang === 'fr' || rawLang === 'french') language = 'fr';
    else if (rawLang === 'ar' || rawLang === 'arabic') language = 'ar';

    return NextResponse.json({
      text: transcription.text,
      language,
    });
  } catch (err) {
    console.error('[/api/transcribe]', err);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
