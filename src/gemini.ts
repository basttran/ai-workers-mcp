import OpenAI from "openai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set");

export const gemini = new OpenAI({
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  apiKey,
});

export const MODEL = "gemini-2.0-flash";
