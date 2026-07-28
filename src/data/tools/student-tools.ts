import type { Tool } from "../types";

export const studentTools: Tool[] = [
  {
    slug: "citation-generator",
    name: "Citation Generator",
    shortDescription: "Create APA, MLA, and Chicago style citations.",
    longDescription:
      "Citation Generator builds correctly formatted citations for books, websites, and journal articles in APA, MLA, and Chicago style, ready to paste into a bibliography.",
    category: "student-tools",
   engine: "citation-generator",
    acceptsUpload: false,
    trending: true,
    popular: true,
    isLive: true,
    faqs: [
      { question: "Which citation styles are supported?", answer: "APA, MLA, and Chicago styles are planned for the initial release." },
      { question: "Can it cite a website automatically from a URL?", answer: "Auto-fill from a URL is a planned feature; manual entry will always be available." },
    ],
  },
  {
    slug: "essay-word-counter",
    name: "Essay Word Counter",
    shortDescription: "Count words, characters, and reading time for essays.",
    longDescription:
      "Essay Word Counter gives a live word and character count along with estimated reading time, helping you hit assignment length requirements.",
    category: "student-tools",
    engine: "text-counter",
    acceptsUpload: false,
    popular: true,
    isLive: true,
    faqs: [
      { question: "Does it count words in headers and footnotes?", answer: "Only the main pasted text is counted, not headers or footnotes." },
    ],
  },
  {
    slug: "study-timer-pomodoro",
    name: "Pomodoro Study Timer",
    shortDescription: "Stay focused with timed study and break intervals.",
    longDescription:
      "Pomodoro Study Timer runs structured focus and break intervals to help you study in short, productive bursts without burning out.",
    category: "student-tools",
    engine: "pomodoro-timer",
    acceptsUpload: false,
    isLive: true,
    faqs: [
      { question: "Can I customize the interval lengths?", answer: "Adjustable focus and break durations are planned alongside the classic 25/5 default." },
    ],
  },
  {
    slug: "flashcard-maker",
    name: "Flashcard Maker",
    shortDescription: "Build digital flashcards for studying and review.",
    longDescription:
      "Flashcard Maker lets you create term and definition pairs and flip through them as digital flashcards for quick review sessions.",
    category: "student-tools",
    engine: "flashcard-maker",
    acceptsUpload: false,
    isLive: true,
    faqs: [
      { question: "Can I save my flashcard sets?", answer: "Saving sets to an account is planned for a future update." },
    ],
  },
  {
    slug: "reference-format-checker",
    name: "Reference Format Checker",
    shortDescription: "Check a reference list for formatting consistency.",
    longDescription:
      "Reference Format Checker reviews a pasted reference list and flags inconsistencies in punctuation, ordering, and structure against the chosen citation style.",
    category: "student-tools",
    engine: "ai-text-generic",
    acceptsUpload: false,
    isLive: true,
    faqs: [
      { question: "Will it fix the formatting automatically?", answer: "It flags issues for you to fix manually; auto-correction is a planned enhancement." },
    ],
  },
];