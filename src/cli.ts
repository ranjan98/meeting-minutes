#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { transcribeAudio } from './services/transcription';
import { generateMinutes } from './services/ai';
import { exportToMarkdown, exportToSlack, exportToNotion } from './services/export';
import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';

const program = new Command();

program
  .name('minutes')
  .description('AI-powered meeting transcription and minutes generation')
  .version('1.0.0');

program
  .command('transcribe <audioFile>')
  .description('Transcribe an audio file and generate meeting minutes')
  .option('-o, --output <path>', 'Output file path', './meeting-minutes.md')
  .option('-s, --slack', 'Post to Slack')
  .option('-n, --notion', 'Post to Notion')
  .option('--no-action-items', 'Skip action items extraction')
  .option('--language <lang>', 'Audio language code (e.g., en, es, fr)', 'en')
  .action(async (audioFile: string, options) => {
    try {
      // Validate file exists
      if (!fs.existsSync(audioFile)) {
        console.error(chalk.red(`Error: Audio file not found: ${audioFile}`));
        process.exit(1);
      }

      console.log(chalk.blue.bold('\n🎙️  MeetingMinutes\n'));

      // Step 1: Transcribe
      const transcribeSpinner = ora('Transcribing audio...').start();
      const transcription = await transcribeAudio(audioFile, options.language);
      transcribeSpinner.succeed('Transcription complete');

      console.log(chalk.gray(`\nTranscript length: ${transcription.text.length} characters`));
      console.log(chalk.gray(`Duration: ${Math.round(transcription.audio_duration / 60)} minutes\n`));

      // Step 2: Generate minutes with AI
      const aiSpinner = ora('Generating meeting minutes with AI...').start();
      const minutes = await generateMinutes(
        transcription.text,
        options.actionItems
      );
      aiSpinner.succeed('Meeting minutes generated');

      // Step 3: Export to Markdown
      const mdSpinner = ora('Saving to Markdown...').start();
      const mdPath = await exportToMarkdown(minutes, options.output);
      mdSpinner.succeed(`Saved to ${chalk.green(mdPath)}`);

      // Step 4: Export to Slack (if requested)
      if (options.slack) {
        const slackSpinner = ora('Posting to Slack...').start();
        await exportToSlack(minutes);
        slackSpinner.succeed('Posted to Slack');
      }

      // Step 5: Export to Notion (if requested)
      if (options.notion) {
        const notionSpinner = ora('Creating Notion page...').start();
        const notionUrl = await exportToNotion(minutes);
        notionSpinner.succeed(`Created Notion page: ${chalk.blue(notionUrl)}`);
      }

      console.log(chalk.green.bold('\n✅ Done!\n'));

      // Display summary
      console.log(chalk.bold('Summary:'));
      console.log(minutes.summary);

      if (minutes.actionItems && minutes.actionItems.length > 0) {
        console.log(chalk.bold('\nAction Items:'));
        minutes.actionItems.forEach((item, idx) => {
          console.log(chalk.yellow(`${idx + 1}. ${item}`));
        });
      }

    } catch (error: any) {
      console.error(chalk.red('\n❌ Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('record')
  .description('Record audio and transcribe (requires ffmpeg)')
  .option('-d, --duration <seconds>', 'Recording duration in seconds', '300')
  .option('-o, --output <path>', 'Output file path', './meeting-minutes.md')
  .action(async (options) => {
    console.log(chalk.yellow('\n🎤 Recording feature coming soon!'));
    console.log(chalk.gray('For now, use system audio recording tools and then run:'));
    console.log(chalk.cyan('minutes transcribe <audio-file>\n'));
  });

program.parse(process.argv);
