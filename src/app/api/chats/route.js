import { NextResponse } from "next/server";
import OpenAI from "openai";

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const { prompt, conversationHistory } = await req.json();

    if (!prompt) {
      return NextResponse.json({ message: "prompt required" }, { status: 401 });
    }

    const messages = conversationHistory.map((item) => ({
      role: item.role, // 'user' or 'system'
      content: item.content,
    }));

    messages.push({ role: "user", content: prompt });

    const response = await openAi.chat.completions.create({
      messages: messages,
      model: "gpt-4-0613",
      temperature: 0.9,
      max_tokens: 1000,
    });

    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 400 });
  }
}
