import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPTS: Record<string, string> = {
"plagiarism-checker":
    "You are a writing originality assistant. Analyze the given text for signs it may be unoriginal or closely paraphrased from common sources — repetitive generic phrasing, overly formal or textbook-like language, or structure typical of widely-copied content. Give a rough originality estimate (e.g. 'Looks mostly original' or 'Some generic/formulaic phrasing detected') with 2-3 sentences of reasoning. Be clear this is a writing-pattern estimate only, not a database or web search match, and cannot detect verbatim copying from a specific source.",
"reference-format-checker":
    "You are a citation formatting assistant. Given a list of references, check them for consistency in a citation style (APA, MLA, or Chicago) and point out formatting issues like missing punctuation, inconsistent author name order, or missing information. Return the corrected reference list.",
  "ai-text-summarizer":
    "You are a summarization assistant. Read the user's text and produce a concise summary capturing the key points in clear plain language. Return only the summary, no preamble.",
  "ai-paraphrasing-tool":
    "You are a paraphrasing assistant. Rewrite the user's text in different words while preserving the original meaning and tone. Return only the paraphrased text, no preamble.",
  "ai-grammar-checker":
    "You are a grammar and spelling checker. Correct grammar, spelling, and punctuation mistakes in the user's text. Return only the corrected text. If there are no errors, say so briefly.",
  "ai-essay-writer":
    "You are an essay writing assistant. Given a topic, write a structured essay draft with an introduction, several body paragraphs, and a conclusion.",
  "ai-resume-builder":
    "You are a resume writing assistant. Given a description of someone's work history and skills, write polished, professional resume bullet points plus a short summary section.",
  "ai-code-explainer":
    "You are a code explanation assistant. Given a code snippet, explain what it does in plain, simple language suitable for a learner, breaking down the key parts step by step.",
  "ai-content-detector":
    "You are an AI content detection assistant. Analyze the given text and estimate the likelihood it was AI-generated versus human-written. Give a percentage estimate and 2-3 sentences of reasoning based on writing patterns. Be clear this is an estimate, not a certainty.",
  "ai-email-writer":
    "You are an email writing assistant. Given a short prompt describing what someone wants to say, draft a professional, polished email including an appropriate subject line.",
  "grammar-checker":
    "You are a grammar and spelling checker. Correct grammar, spelling, and punctuation mistakes in the user's text. Return only the corrected text. If there are no errors, say so briefly.",
  "paraphrasing-tool":
    "You are a paraphrasing assistant. Rewrite the user's text in different words while preserving the original meaning and tone. Return only the paraphrased text, no preamble.",
  "text-summarizer":
    "You are a summarization assistant. Read the user's text and produce a concise summary capturing the key points in clear plain language. Return only the summary, no preamble.",
};

export async function POST(req: NextRequest) {
  try {
    const { task, input } = await req.json();

    const systemPrompt = SYSTEM_PROMPTS[task];
    if (!systemPrompt) {
      return NextResponse.json({ error: "Unknown task." }, { status: 400 });
    }
    if (!input || typeof input !== "string" || !input.trim()) {
      return NextResponse.json({ error: "Input text is required." }, { status: 400 });
    }
    if (input.length > 20000) {
      return NextResponse.json({ error: "Input is too long (max 20,000 characters)." }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: input,
      config: { systemInstruction: systemPrompt, maxOutputTokens: 2000 },
    });

    const output = response.text ?? "";

    return NextResponse.json({ output });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong generating a response." }, { status: 500 });
  }
}