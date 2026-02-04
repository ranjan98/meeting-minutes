import axios from 'axios';
import FormData from 'form-data';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;

if (!ASSEMBLYAI_API_KEY) {
  throw new Error('ASSEMBLYAI_API_KEY is required in .env file');
}

interface TranscriptionResult {
  text: string;
  audio_duration: number;
  words?: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

export async function transcribeAudio(
  audioFilePath: string,
  language: string = 'en'
): Promise<TranscriptionResult> {
  try {
    // Step 1: Upload audio file
    const uploadUrl = await uploadAudioFile(audioFilePath);

    // Step 2: Request transcription
    const transcriptId = await requestTranscription(uploadUrl, language);

    // Step 3: Poll for completion
    const result = await pollTranscription(transcriptId);

    return {
      text: result.text,
      audio_duration: result.audio_duration / 1000, // Convert to seconds
      words: result.words,
    };
  } catch (error: any) {
    throw new Error(`Transcription failed: ${error.message}`);
  }
}

async function uploadAudioFile(filePath: string): Promise<string> {
  const fileStream = fs.createReadStream(filePath);

  const response = await axios.post(
    'https://api.assemblyai.com/v2/upload',
    fileStream,
    {
      headers: {
        authorization: ASSEMBLYAI_API_KEY!,
        'content-type': 'application/octet-stream',
      },
    }
  );

  return response.data.upload_url;
}

async function requestTranscription(
  audioUrl: string,
  language: string
): Promise<string> {
  const response = await axios.post(
    'https://api.assemblyai.com/v2/transcript',
    {
      audio_url: audioUrl,
      language_code: language,
      punctuate: true,
      format_text: true,
    },
    {
      headers: {
        authorization: ASSEMBLYAI_API_KEY!,
        'content-type': 'application/json',
      },
    }
  );

  return response.data.id;
}

async function pollTranscription(transcriptId: string): Promise<any> {
  const maxAttempts = 180; // 15 minutes max
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await axios.get(
      `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
      {
        headers: {
          authorization: ASSEMBLYAI_API_KEY!,
        },
      }
    );

    const { status } = response.data;

    if (status === 'completed') {
      return response.data;
    } else if (status === 'error') {
      throw new Error('Transcription failed');
    }

    // Wait 5 seconds before next poll
    await new Promise((resolve) => setTimeout(resolve, 5000));
    attempts++;
  }

  throw new Error('Transcription timeout');
}
