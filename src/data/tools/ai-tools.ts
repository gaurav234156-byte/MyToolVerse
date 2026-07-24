import type { Tool } from "../types";

export const aiTools: Tool[] = [
  {
    slug: "ai-text-summarizer",
    name: "AI Text Summarizer",
    shortDescription: "Condense long articles and documents into key points.",
    longDescription:
      "AI Text Summarizer reads through long passages of text and produces a short summary that keeps the main ideas, so you can grasp a document without reading the whole thing.",
    category: "ai-tools",
    engine: "ai-generic-api",
    acceptsUpload: false,
    trending: true,
    popular: true,
    isLive: false,
    faqs: [
      { question: "What length documents can it handle?", answer: "Once connected, it will support documents up to several thousand words per request." },
      { question: "Can I choose the summary length?", answer: "Yes, short, medium, and detailed summary options are planned." },
    ],
  },
  {
    slug: "ai-paraphrasing-tool",
    name: "AI Paraphrasing Tool",
    shortDescription: "Rewrite sentences and paragraphs in a different style.",
    longDescription:
      "AI Paraphrasing Tool rewords your text while preserving its meaning, useful for varying tone, avoiding repetition, or simplifying complex sentences.",
    category: "ai-tools",
    engine: "ai-generic-api",
    acceptsUpload: false,
    trending: true,
    popular: true,
    isLive: false,
    faqs: [
      { question: "Will paraphrased text still mean the same thing?", answer: "Yes, the tool aims to preserve meaning while changing wording and structure." },
    ],
  },
  {
    slug: "ai-grammar-checker",
    name: "AI Grammar Checker",
    shortDescription: "Catch grammar, spelling, and punctuation mistakes.",
    longDescription:
      "AI Grammar Checker scans your writing for grammar, spelling, and punctuation issues and suggests corrections inline.",
    category: "ai-tools",
    engine: "ai-generic-api",
    acceptsUpload: false,
    popular: true,
    isLive: false,
    faqs: [
      { question: "Does it support languages other than English?", answer: "English is supported first, with more languages planned after launch." },
    ],
  },
  {
    slug: "ai-essay-writer",
    name: "AI Essay Writer",
    shortDescription: "Generate a structured essay draft from a topic.",
    longDescription:
      "AI Essay Writer takes a topic and key points and produces a structured first draft with an introduction, body paragraphs, and conclusion to build from.",
    category: "ai-tools",
    engine: "ai-generic-api",
    acceptsUpload: false,
    isLive: false,
    faqs: [
      { question: "Is the generated essay ready to submit as-is?", answer: "Treat it as a starting draft to edit and personalize, not a final submission." },
    ],
  },
  {
    slug: "ai-image-generator",
    name: "AI Image Generator",
    shortDescription: "Create images from a text description.",
    longDescription:
      "AI Image Generator turns a written prompt into a generated image, useful for illustrations, concept art, and visual ideas.",
    category: "ai-tools",
    engine: "ai-generic-api",
    acceptsUpload: false,
    trending: true,
    isLive: false,
    faqs: [
      { question: "What image sizes will be supported?", answer: "Common square and widescreen sizes are planned at launch." },
    ],
  },
  {
    slug: "ai-chatbot-assistant",
    name: "AI Chat Assistant",
    shortDescription: "Ask questions and get conversational answers.",
    longDescription:
      "AI Chat Assistant provides a conversational interface for asking questions, brainstorming, and getting quick explanations.",
    category: "ai-tools",
    engine: "ai-generic-api",
    acceptsUpload: false,
    isLive: false,
    faqs: [
      { question: "Does it remember earlier messages in a session?", answer: "Yes, the planned design keeps context within a single chat session." },
    ],
  },
  {
    slug: "ai-resume-builder",
    name: "AI Resume Builder",
    shortDescription: "Generate resume content from your work history.",
    longDescription:
      "AI Resume Builder takes your job history and skills and suggests polished bullet points and summaries you can use on your resume.",
    category: "ai-tools",
    engine: "ai-generic-api",
    acceptsUpload: false,
    isLive: false,
    faqs: [
      { question: "Will it format the resume layout too?", answer: "Content generation comes first; layout templates are a planned follow-up." },
    ],
  },
  {
    slug: "ai-code-explainer",
    name: "AI Code Explainer",
    shortDescription: "Get a plain-language explanation of any code snippet.",
    longDescription:
      "AI Code Explainer reads a block of code and explains what it does in plain language, helpful for learning or reviewing unfamiliar code.",
    category: "ai-tools",
    engine: "ai-generic-api",
    acceptsUpload: false,
    isLive: false,
    faqs: [
      { question: "Which programming languages will be supported?", answer: "Common languages like JavaScript, Python, and Java are planned at launch." },
    ],
  },
  {
    slug: "ai-content-detector",
    name: "AI Content Detector",
    shortDescription: "Estimate the likelihood text was AI-generated.",
    longDescription:
      "AI Content Detector analyzes writing patterns to estimate the probability that a piece of text was generated by an AI model.",
    category: "ai-tools",
    engine: "ai-generic-api",
    acceptsUpload: false,
    isLive: false,
    faqs: [
      { question: "How accurate is AI detection?", answer: "No detector is perfectly accurate; results should be treated as an indicator, not proof." },
    ],
  },
  {
    slug: "ai-email-writer",
    name: "AI Email Writer",
    shortDescription: "Draft professional emails from a quick prompt.",
    longDescription:
      "AI Email Writer turns a short description of what you want to say into a complete, professionally worded email draft.",
    category: "ai-tools",
    engine: "ai-generic-api",
    acceptsUpload: false,
    isLive: false,
    faqs: [
      { question: "Can I set the tone of the email?", answer: "Formal, friendly, and direct tone options are planned." },
    ],
  },
];
