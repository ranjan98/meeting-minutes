# MeetingMinutes

Stop wasting time writing meeting notes. Record, transcribe, and extract action items automatically with AI.

## What It Does

MeetingMinutes takes your audio recordings and turns them into structured meeting notes with:

- **Automatic transcription** using AssemblyAI's speech-to-text
- **AI-powered summarization** with Claude to extract key points
- **Action item detection** so you never miss a to-do
- **Multiple export formats** - Markdown, Slack, Notion

Perfect for remote teams, 1-on-1s, sprint planning, or any meeting where you'd rather focus on the conversation than taking notes.

## Quick Start

### Installation

```bash
npm install -g meeting-minutes
```

Or clone and run locally:

```bash
git clone https://github.com/ranjan98/meeting-minutes.git
cd meeting-minutes
npm install
npm run build
```

### Setup

1. Get your API keys:
   - **AssemblyAI**: Sign up at [assemblyai.com](https://www.assemblyai.com/) (free tier available)
   - **Anthropic**: Get your key at [console.anthropic.com](https://console.anthropic.com/)

2. Create a `.env` file:

```bash
cp .env.example .env
```

3. Add your keys:

```bash
ANTHROPIC_API_KEY=sk-ant-your-key-here
ASSEMBLYAI_API_KEY=your-assemblyai-key-here

# Optional integrations
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
NOTION_TOKEN=secret_your-notion-token
NOTION_DATABASE_ID=your-database-id
```

## Usage

### Basic Transcription

```bash
# Transcribe and generate minutes
minutes transcribe meeting.mp3

# Specify output location
minutes transcribe meeting.mp3 --output ./notes/standup.md

# Skip action items extraction
minutes transcribe meeting.mp3 --no-action-items

# Specify language
minutes transcribe meeting.mp3 --language es
```

### Export to Slack

```bash
# Post minutes directly to Slack
minutes transcribe meeting.mp3 --slack
```

Set up a [Slack Incoming Webhook](https://api.slack.com/messaging/webhooks) and add the URL to your `.env` file.

### Export to Notion

```bash
# Create a Notion page with minutes
minutes transcribe meeting.mp3 --notion
```

Requires Notion integration token and database ID in `.env`.

## Example Output

**Input**: 15-minute team standup recording

**Output** (`meeting-minutes.md`):

```markdown
# Team Standup - Product Launch Planning

**Date:** January 15, 2026

**Participants:** Sarah, Mike, Jessica

## Summary

The team discussed final preparations for the product launch scheduled for next week. Key focus areas include marketing materials, bug fixes, and customer support readiness.

## Key Discussion Points

- Marketing website needs final review from legal team
- Three critical bugs identified in the checkout flow
- Customer support team requires additional training on new features
- Launch date confirmed for January 22nd

## Decisions Made

- Delay launch by 2 days if legal review isn't complete by Friday
- Assign Jessica to handle customer support training materials
- Schedule daily check-ins until launch

## Action Items

- [ ] Sarah: Get legal approval for marketing copy by EOD Thursday
- [ ] Mike: Fix checkout bugs and deploy to staging by tomorrow
- [ ] Jessica: Create support documentation by Friday morning
- [ ] Team: Final launch readiness check on Monday 10 AM
```

## Supported Audio Formats

- MP3
- WAV
- M4A
- MP4 (audio track)
- FLAC
- OGG

## Slack Integration

The Slack export creates a nicely formatted message with:

- Meeting title as header
- Summary section
- Bulleted key points
- Checkbox action items

Perfect for sharing with your team immediately after a meeting.

## Notion Integration

Creates a page in your specified database with:

- Meeting title and date
- Full summary and discussion points
- Action items as checkboxes
- Decisions documented

## Tips for Best Results

1. **Clear audio quality** - Use a decent microphone, avoid background noise
2. **Speaker identification** - Have participants introduce themselves at the start
3. **Structured discussions** - Explicitly state "action item" or "decision" for better extraction
4. **Reasonable length** - Works best with 5-60 minute meetings

## Cost Estimate

Based on typical usage:

- **AssemblyAI**: $0.00025/second (~$1.50/hour of audio)
- **Anthropic Claude**: ~$0.02-0.10 per meeting (depending on length)

A typical 30-minute meeting costs about $0.80 total.

## Privacy

All processing happens through encrypted API calls. No audio or transcripts are stored on our servers. Audio files remain on your local machine.

## Roadmap

- [ ] Live recording directly from CLI
- [ ] Speaker diarization (who said what)
- [ ] Multi-language support
- [ ] Custom prompt templates
- [ ] Google Meet/Zoom integration
- [ ] Browser extension for one-click recording

## Contributing

Found a bug? Have a feature idea? Contributions welcome!

```bash
git clone https://github.com/ranjan98/meeting-minutes.git
cd meeting-minutes
npm install
npm run dev transcribe test-audio.mp3
```

## License

MIT License - see [LICENSE](LICENSE) for details

---

**Built by remote workers, for remote workers.**

If this saved you time, give it a star! ⭐
