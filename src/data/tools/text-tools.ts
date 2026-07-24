import type { Tool } from "../types";

export const textTools: Tool[] = [
  {
    slug: "word-counter",
    name: "Word Counter",
    shortDescription: "Count words, characters, sentences, and paragraphs.",
    longDescription:
      "Word Counter analyzes your text and shows word count, character count, sentence count, and estimated reading time as you type.",
    category: "text-tools",
    engine: "text-counter",
    acceptsUpload: false,
    popular: true,
    isLive: true,
    faqs: [
      { question: "Does it count spaces as characters?", answer: "Character counts are shown both with and without spaces." },
      { question: "How is reading time calculated?", answer: "Based on an average adult reading speed of 200 words per minute." },
    ],
  },
  {
    slug: "character-counter",
    name: "Character Counter",
    shortDescription: "Track character count for posts, bios, and limits.",
    longDescription:
      "Character Counter shows a live character total as you type, with quick presets for common limits like X posts and meta descriptions.",
    category: "text-tools",
    engine: "text-counter",
    acceptsUpload: false,
    isLive: true,
    faqs: [
      { question: "Can I set a custom character limit to track against?", answer: "Yes, enter any limit and the counter shows how many characters remain." },
    ],
  },
  {
    slug: "case-converter",
    name: "Case Converter",
    shortDescription: "Switch text between upper, lower, title, and sentence case.",
    longDescription:
      "Case Converter transforms your text into UPPERCASE, lowercase, Title Case, Sentence case, or camelCase with one click each.",
    category: "text-tools",
    engine: "text-case",
    acceptsUpload: false,
    popular: true,
    isLive: true,
    faqs: [
      { question: "Does it work on entire paragraphs?", answer: "Yes, paste any length of text and the case conversion applies to all of it." },
    ],
  },
  {
    slug: "text-to-speech",
    name: "Text to Speech",
    shortDescription: "Convert written text into natural-sounding spoken audio.",
    longDescription:
      "Text to Speech reads your text aloud using a natural voice, with adjustable speed and pitch, and lets you download the result as an audio file.",
    category: "text-tools",
    engine: "text-generic",
    acceptsUpload: false,
    trending: true,
    isLive: false,
    faqs: [
      { question: "What languages are supported?", answer: "Major languages are supported, with multiple voice options for each." },
      { question: "Can I download the audio?", answer: "Yes, generated speech can be downloaded as an MP3 file." },
    ],
  },
  {
    slug: "speech-to-text",
    name: "Speech to Text",
    shortDescription: "Transcribe spoken audio into written text.",
    longDescription:
      "Speech to Text listens to an audio recording or live microphone input and transcribes the words into editable text.",
    category: "text-tools",
    engine: "text-generic",
    acceptsUpload: true,
    acceptedFormats: [".mp3", ".wav", ".m4a"],
    isLive: false,
    faqs: [
      { question: "Does it handle background noise well?", answer: "Clear recordings work best; heavy background noise can reduce accuracy." },
    ],
  },
  {
    slug: "plagiarism-checker",
    name: "Plagiarism Checker",
    shortDescription: "Scan text for matches against published web content.",
    longDescription:
      "Plagiarism Checker compares your writing against indexed web content and flags sections that closely match existing sources, with a similarity score.",
    category: "text-tools",
    engine: "text-generic",
    acceptsUpload: false,
    popular: true,
    isLive: false,
    faqs: [
      { question: "How much text can I check at once?", answer: "Up to 5,000 words per scan." },
    ],
  },
  {
    slug: "grammar-checker",
    name: "Grammar Checker",
    shortDescription: "Find and fix grammar, spelling, and punctuation errors.",
    longDescription:
      "Grammar Checker reviews your text for common mistakes and suggests corrections inline, so you can accept fixes one by one or all at once.",
    category: "text-tools",
    engine: "text-generic",
    acceptsUpload: false,
    trending: true,
    popular: true,
    isLive: false,
    faqs: [
      { question: "Does it explain why something is wrong?", answer: "Yes, each suggestion includes a short explanation of the grammar rule involved." },
    ],
  },
  {
    slug: "paraphrasing-tool",
    name: "Paraphrasing Tool",
    shortDescription: "Rewrite text in a different style while keeping the meaning.",
    longDescription:
      "Paraphrasing Tool rewords sentences to sound different while preserving the original meaning, with adjustable tone settings like formal or casual.",
    category: "text-tools",
    engine: "text-generic",
    acceptsUpload: false,
    isLive: false,
    faqs: [
      { question: "Will it change the meaning of my text?", answer: "The goal is to preserve meaning; always review the result before using it." },
    ],
  },
  {
    slug: "text-diff-checker",
    name: "Text Compare",
    shortDescription: "Highlight the differences between two blocks of text.",
    longDescription:
      "Text Compare lines up two passages and highlights every word that was added, removed, or changed between them.",
    category: "text-tools",
    engine: "text-diff",
    acceptsUpload: false,
    isLive: true,
    faqs: [
      { question: "Can I compare entire documents?", answer: "Paste content of any length; very long documents may take a moment to render." },
    ],
  },
  {
    slug: "duplicate-line-remover",
    name: "Duplicate Line Remover",
    shortDescription: "Remove repeated lines from a list of text.",
    longDescription:
      "Duplicate Line Remover scans a list and removes any line that appears more than once, keeping the first occurrence and original order.",
    category: "text-tools",
    engine: "text-generic",
    acceptsUpload: false,
    isLive: true,
    faqs: [
      { question: "Is the comparison case-sensitive?", answer: "There's a toggle to treat differently-cased duplicates as the same or different." },
    ],
  },
  {
    slug: "text-reverser",
    name: "Text Reverser",
    shortDescription: "Flip text backwards, character by character or by word.",
    longDescription:
      "Text Reverser reverses your input either letter-by-letter or word-by-word, useful for puzzles, novelty text, or testing string logic.",
    category: "text-tools",
    engine: "text-generic",
    acceptsUpload: false,
    isLive: true,
    faqs: [
      { question: "Can I reverse just the word order, not letters?", answer: "Yes, choose word-order reversal as an option instead of full character reversal." },
    ],
  },
  {
    slug: "whitespace-remover",
    name: "Remove Extra Spaces",
    shortDescription: "Clean up double spaces, tabs, and stray line breaks.",
    longDescription:
      "Remove Extra Spaces tidies messy text by collapsing repeated spaces, trimming line ends, and removing blank lines you don't want.",
    category: "text-tools",
    engine: "text-generic",
    acceptsUpload: false,
    isLive: true,
    faqs: [
      { question: "Will this affect intentional formatting like code indentation?", answer: "This tool targets prose text; for code, use a dedicated formatter instead." },
    ],
  },
  {
    slug: "slug-generator",
    name: "Slug Generator",
    shortDescription: "Turn a title into a clean, URL-friendly slug.",
    longDescription:
      "Slug Generator converts any title or phrase into lowercase, hyphenated text safe for use in URLs, stripping special characters automatically.",
    category: "text-tools",
    engine: "text-generic",
    acceptsUpload: false,
    isLive: true,
    faqs: [
      { question: "Does it handle accented characters?", answer: "Yes, accented letters are converted to their closest plain-letter equivalent." },
    ],
  },
  {
    slug: "text-summarizer",
    name: "Text Summarizer",
    shortDescription: "Condense long text into a short summary.",
    longDescription:
      "Text Summarizer reads through long articles or reports and produces a shorter summary capturing the main points, with adjustable summary length.",
    category: "text-tools",
    engine: "text-generic",
    acceptsUpload: false,
    trending: true,
    isLive: false,
    faqs: [
      { question: "Can I control how short the summary is?", answer: "Yes, choose a target length from a few sentences to a few paragraphs." },
    ],
  },
  {
    slug: "word-frequency-counter",
    name: "Word Frequency Counter",
    shortDescription: "See which words appear most often in your text.",
    longDescription:
      "Word Frequency Counter breaks down your text and ranks every word by how often it appears, useful for spotting overused words before editing.",
    category: "text-tools",
    engine: "text-counter",
    acceptsUpload: false,
    isLive: true,
    faqs: [
      { question: "Does it ignore common words like \"the\" and \"and\"?", answer: "There's a toggle to exclude common stop words from the ranking." },
    ],
  },
];
