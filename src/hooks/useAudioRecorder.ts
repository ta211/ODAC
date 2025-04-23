// src/hooks/useAudioRecorder.ts

import { useState, useEffect, useRef } from 'react';

export function useAudioRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [audioData, setAudioData] = useState<AudioBuffer | null>(null);
    const [duration, setDuration] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const audioChunksRef = useRef<Float32Array[]>([]);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = async () => {
        setAudioData(null);
        setDuration(0);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new AudioContext({ sampleRate: 16000 });
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(4096, 1, 1);

            source.connect(processor);
            processor.connect(audioContext.destination);

            processor.onaudioprocess = (event) => {
                const data = event.inputBuffer.getChannelData(0);
                audioChunksRef.current.push(new Float32Array(data));
            };

            setIsRecording(true);

            // Update duration every second
            recordingIntervalRef.current = setInterval(() => {
                setDuration((prev) => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = async () => {
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
        }

        // Concatenate audio chunks
        const audioDataArray = audioChunksRef.current;
        const length = audioDataArray.reduce((acc, chunk) => acc + chunk.length, 0);
        const result = new Float32Array(length);
        let offset = 0;
        for (const chunk of audioDataArray) {
            result.set(chunk, offset);
            offset += chunk.length;
        }

        // Create AudioBuffer
        const audioContext = new AudioContext({ sampleRate: 16000 });
        const audioBuffer = audioContext.createBuffer(1, result.length, 16000);
        audioBuffer.copyToChannel(result, 0);

        setAudioData(audioBuffer);

        // Reset
        audioChunksRef.current = [];
        setIsRecording(false);
    };

    useEffect(() => {
        return () => {
            if (recordingIntervalRef.current) {
                clearInterval(recordingIntervalRef.current);
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    return { isRecording, startRecording, stopRecording, audioData, duration };
}
