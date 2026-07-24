import type { Tool } from "../types";

export const audioTools: Tool[] = [
  {
    slug: "audio-converter",
    name: "Audio Converter",
    shortDescription: "Convert audio files between common formats.",
    longDescription:
      "Audio Converter changes audio files between formats like MP3, WAV, and AAC, so they play correctly on the app or device you need.",
    category: "audio-tools",
    engine: "audio-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".mp3", ".wav", ".aac", ".flac"],
    trending: true,
    popular: true,
    isLive: false,
    faqs: [
      { question: "Which audio formats are supported?", answer: "MP3, WAV, AAC, and FLAC are planned as supported formats." },
    ],
  },
  {
    slug: "trim-audio",
    name: "Trim Audio",
    shortDescription: "Cut an audio file down to a chosen section.",
    longDescription:
      "Trim Audio lets you select a start and end point on an audio waveform and export just that clip.",
    category: "audio-tools",
    engine: "audio-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".mp3", ".wav"],
    popular: true,
    isLive: false,
    faqs: [
      { question: "Can I preview before exporting?", answer: "A waveform preview with playback is planned for the editing interface." },
    ],
  },
  {
    slug: "compress-audio",
    name: "Compress Audio",
    shortDescription: "Reduce audio file size for easier sharing.",
    longDescription:
      "Compress Audio reduces the file size of audio recordings and music files while keeping them listenable, useful for email attachments and storage limits.",
    category: "audio-tools",
    engine: "audio-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".mp3", ".wav"],
    isLive: false,
    faqs: [
      { question: "Will compression reduce audio quality noticeably?", answer: "Moderate compression settings aim to keep quality close to the original." },
    ],
  },
  {
    slug: "audio-merger",
    name: "Merge Audio",
    shortDescription: "Combine multiple audio clips into one file.",
    longDescription:
      "Merge Audio joins several audio files together in order to create a single combined track.",
    category: "audio-tools",
    engine: "audio-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".mp3", ".wav"],
    isLive: false,
    faqs: [
      { question: "Can I reorder clips before merging?", answer: "Drag-to-reorder is planned in the upload list before merging." },
    ],
  },
  {
    slug: "voice-recorder-online",
    name: "Online Voice Recorder",
    shortDescription: "Record audio directly from your microphone.",
    longDescription:
      "Online Voice Recorder captures audio straight from your microphone in the browser and lets you download the recording as an audio file.",
    category: "audio-tools",
    engine: "audio-generic-api",
    acceptsUpload: false,
    isLive: false,
    faqs: [
      { question: "Does this require installing software?", answer: "No, recording happens directly in your browser with microphone permission." },
    ],
  },
  {
    slug: "text-to-speech",
    name: "Text to Speech",
    shortDescription: "Convert written text into spoken audio.",
    longDescription:
      "Text to Speech reads your written text aloud using a natural-sounding voice and lets you download the result as an audio file.",
    category: "audio-tools",
    engine: "audio-generic-api",
    acceptsUpload: false,
    trending: true,
    isLive: false,
    faqs: [
      { question: "Will multiple voices be available?", answer: "A selection of voices and languages is planned at launch." },
    ],
  },
];
