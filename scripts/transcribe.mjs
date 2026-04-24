import fs from 'fs';
import path from 'path';
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import OpenAI from 'openai';
import 'dotenv/config';
import ora from 'ora';
import chalk from 'chalk';

// Configure FFmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

const VIDEO_DIR = '/Users/styserg/Desktop/SmartMoney/';
const TEMP_DIR = path.join(process.cwd(), 'temp_audio');

const apiKey = process.env.OPENAI_API_KEY || process.env.DASHSCOPE_API_KEY;
const baseURL = process.env.OPENAI_BASE_URL || (process.env.DASHSCOPE_API_KEY ? 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1' : undefined);

const client = new OpenAI({
  apiKey: apiKey,
  baseURL: baseURL,
});

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function extractAudio(videoPath, audioPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .toFormat('mp3')
      .audioChannels(1)
      .audioBitrate('48k')
      .on('end', () => resolve(audioPath))
      .on('error', (err) => reject(err))
      .save(audioPath);
  });
}

async function splitAudio(audioPath, outputPattern) {
  return new Promise((resolve, reject) => {
    ffmpeg(audioPath)
      .outputOptions([
        '-f segment',
        '-segment_time 120', // 2 minutes chunks
        '-reset_timestamps 1'
      ])
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .save(outputPattern);
  });
}

async function transcribeChunk(chunkPath) {
  if (baseURL?.includes('dashscope')) {
    const audioBase64 = fs.readFileSync(chunkPath).toString('base64');
    const response = await client.chat.completions.create({
      model: 'qwen3.5-omni-flash',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'You are an expert transcriber. Please transcribe the following audio recording into clear text. Do not add any commentary, only the transcription.' },
            { type: 'input_audio', input_audio: { data: `data:audio/mp3;base64,${audioBase64}` } }
          ]
        }
      ]
    });
    return response.choices[0].message.content;
  } else {
    const response = await client.audio.transcriptions.create({
      file: fs.createReadStream(chunkPath),
      model: 'whisper-1',
    });
    return response.text;
  }
}

async function processVideo(filename) {
  const videoPath = path.join(VIDEO_DIR, filename);
  const baseName = path.parse(filename).name;
  const projectTempDir = path.join(TEMP_DIR, baseName);
  const fullAudioPath = path.join(projectTempDir, 'full.mp3');
  const outputPath = path.join(VIDEO_DIR, `${baseName}.txt`);

  const spinner = ora(`Processing ${chalk.cyan(filename)}...`).start();

  try {
    await ensureDir(projectTempDir);

    // 1. Extract Audio
    spinner.text = `Extracting audio...`;
    await extractAudio(videoPath, fullAudioPath);

    // 2. Split into chunks
    spinner.text = `Splitting into chunks...`;
    const chunkPattern = path.join(projectTempDir, 'chunk_%03d.mp3');
    await splitAudio(fullAudioPath, chunkPattern);

    // 3. Transcribe chunks
    const chunks = fs.readdirSync(projectTempDir).filter(f => f.startsWith('chunk_')).sort();
    let fullTranscription = '';

    for (let i = 0; i < chunks.length; i++) {
      spinner.text = `Transcribing chunk ${i + 1}/${chunks.length}...`;
      const chunkText = await transcribeChunk(path.join(projectTempDir, chunks[i]));
      fullTranscription += chunkText + ' ';
    }

    // 4. Save output
    fs.writeFileSync(outputPath, fullTranscription.trim());
    spinner.succeed(`Finished: ${chalk.green(baseName)}.txt created.`);

    // Cleanup
    fs.rmSync(projectTempDir, { recursive: true, force: true });

  } catch (error) {
    spinner.fail(`Error processing ${filename}: ${error.message}`);
    console.error(error);
  }
}

async function main() {
  console.log(chalk.bold.magenta('\n🚀 SmartMoney Video Transcriber (Chunked Mode)\n'));

  if (!apiKey) {
    console.error(chalk.red('❌ API Key not found.'));
    process.exit(1);
  }

  await ensureDir(TEMP_DIR);

  const args = process.argv.slice(2);
  const fileArg = args.find(arg => arg.startsWith('--file='))?.split('=')[1];

  let files = [];
  if (fileArg) {
    if (fs.existsSync(path.join(VIDEO_DIR, fileArg))) {
      files = [fileArg];
    } else {
      console.error(chalk.red(`❌ File not found: ${fileArg}`));
      process.exit(1);
    }
  } else {
    files = fs.readdirSync(VIDEO_DIR).filter(f => f.endsWith('.mp4'));
  }

  if (files.length === 0) {
    console.log(chalk.yellow('No .mp4 files found.'));
    return;
  }

  console.log(`Found ${files.length} videos. Starting...\n`);

  for (const file of files) {
    const baseName = path.parse(file).name;
    const outputPath = path.join(VIDEO_DIR, `${baseName}.txt`);
    
    if (fs.existsSync(outputPath)) {
      console.log(chalk.gray(`Skipping ${file} (already transcribed).`));
      continue;
    }
    await processVideo(file);
  }

  console.log(chalk.bold.green('\n✅ All tasks completed!\n'));
}

main();
