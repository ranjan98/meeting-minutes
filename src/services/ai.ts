import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required in .env file');
  }
  return new Anthropic({ apiKey });
}

export interface MeetingMinutes {
  title: string;
  date: string;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  decisions: string[];
  participants?: string[];
  rawTranscript: string;
}

export async function generateMinutes(
  transcript: string,
  includeActionItems: boolean = true
): Promise<MeetingMinutes> {
  const prompt = `You are an expert meeting assistant. Analyze this meeting transcript and extract structured information.

Transcript:
${transcript}

Please provide:
1. A concise meeting title (5-10 words)
2. A brief summary (2-3 sentences)
3. Key discussion points (bullet points)
${includeActionItems ? '4. Action items with owners if mentioned' : ''}
5. Decisions made
6. Participants mentioned (if any)

Format your response as JSON with this structure:
{
  "title": "Meeting title",
  "summary": "Brief summary",
  "keyPoints": ["point 1", "point 2"],
  "actionItems": ["action 1", "action 2"],
  "decisions": ["decision 1", "decision 2"],
  "participants": ["person 1", "person 2"]
}`;

  const anthropic = getAnthropicClient();
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  // Extract JSON from response
  const jsonMatch = content.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Could not parse Claude response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    title: parsed.title,
    date: new Date().toISOString(),
    summary: parsed.summary,
    keyPoints: parsed.keyPoints || [],
    actionItems: includeActionItems ? (parsed.actionItems || []) : [],
    decisions: parsed.decisions || [],
    participants: parsed.participants || [],
    rawTranscript: transcript,
  };
}
