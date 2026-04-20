import OpenAI from 'openai';
import 'dotenv/config';

const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: process.env.DASHSCOPE_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
});

async function main() {
  try {
    console.log(`Using Key: ${process.env.DASHSCOPE_API_KEY?.substring(0, 5)}...`);
    const completion = await client.chat.completions.create({
      model: "qwen-plus",
      messages: [{ role: "user", content: "Say 'Qwen connection successful!'" }],
    });
    console.log(completion.choices[0].message.content);
  } catch (error) {
    console.error("Connection failed:", error.message);
  }
}

main();
