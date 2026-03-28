'use client';

import { useRef, useEffect, useState } from 'react';
import { TranscriptSegment } from '@/types/meeting';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff } from 'lucide-react';

interface AudioRecorderProps {
  isRecording: boolean;
  onTranscriptUpdate: (segment: TranscriptSegment) => void;
}

export default function AudioRecorder({ isRecording, onTranscriptUpdate }: AudioRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const animationRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
    return () => {
      stopRecording();
      cancelAnimationFrame(animationRef.current);
    };
  // startRecording/stopRecording are intentionally excluded: they are stable inner functions
  // that only depend on refs and callbacks, and re-declaring them would cause infinite loops.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const updateLevel = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(avg);
        animationRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await sendForTranscription(blob);
      };

      mediaRecorder.start(5000);
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    cancelAnimationFrame(animationRef.current);
    setAudioLevel(0);
  };

  const sendForTranscription = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      const response = await fetch('/api/transcribe', { method: 'POST', body: formData });
      if (response.ok) {
        const data = await response.json();
        onTranscriptUpdate({
          id: Date.now().toString(),
          speaker: 'Speaker',
          text: data.text,
          timestamp: Date.now(),
          language: 'mixed',
        });
      }
    } catch (err) {
      console.error('Transcription failed:', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          {isRecording ? (
            <Mic className="w-4 h-4 text-red-500 animate-pulse" />
          ) : (
            <MicOff className="w-4 h-4 text-gray-400" />
          )}
          Audio Input
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, (audioLevel / 128) * 100)}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{isRecording ? 'Live' : 'Off'}</span>
        </div>
      </CardContent>
    </Card>
  );
}
