import { NextResponse } from "next/server";
import OpenAI from "openai";

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const functions = [
  {
    name: "get_Yes",
    description: "",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Yes",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "update_registration",
    description: "",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Update registration",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "pre_qualify_company",
    description: "",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Apply to prequalify your company",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "registered_pre_qualify",
    description: "",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Yes, I am registered for pre qualify",
        },
      },
      required: ["query"],
    },
  },
];

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
      model: "gpt-3.5-turbo",
      temperature: 0.9,
      max_tokens: 1000,
      functions: functions,
      function_call: "auto",
    });

    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 400 });
  }
}
