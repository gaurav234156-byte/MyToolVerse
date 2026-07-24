import type { Tool } from "../types";

export const videoTools: Tool[] = [
  {
    slug: "compress-video",
    name: "Compress Video",
    shortDescription: "Reduce video file size without losing quality.",
    longDescription:
      "Compress Video shrinks large video files so they're easier to upload, share, or send by email, while keeping resolution and quality as close to the original as possible.",
    category: "video-tools",
    engine: "video-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".mp4", ".mov", ".avi", ".mkv"],
    trending: true,
    popular: true,
    isLive: false,
    faqs: [
      { question: "What video formats will be supported?", answer: "MP4, MOV, AVI, and MKV are planned for the initial release." },
      { question: "Is there a file size limit?", answer: "A generous size limit is planned; very large files may require a paid tier." },
    ],
  },
  {
    slug: "video-to-mp3",
    name: "Video to MP3",
    shortDescription: "Extract the audio track from any video file.",
    longDescription:
      "Video to MP3 pulls the audio out of a video file and saves it as a standalone MP3, useful for podcasts, lectures, and music clips.",
    category: "video-tools",
    engine: "video-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".mp4", ".mov", ".avi"],
    popular: true,
    isLive: false,
    faqs: [
      { question: "Does it keep the original audio quality?", answer: "The tool aims to extract audio at the source video's original bitrate." },
    ],
  },
  {
    slug: "trim-video",
    name: "Trim Video",
    shortDescription: "Cut a video down to a specific start and end point.",
    longDescription:
      "Trim Video lets you select an in-point and out-point on a video timeline and export just that section, without re-encoding the whole file.",
    category: "video-tools",
    engine: "video-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".mp4", ".mov"],
    trending: true,
    isLive: false,
    faqs: [
      { question: "Can I trim multiple sections at once?", answer: "Single-section trimming is planned first, with multi-clip support to follow." },
    ],
  },
  {
    slug: "video-converter",
    name: "Video Converter",
    shortDescription: "Convert video files between common formats.",
    longDescription:
      "Video Converter changes a video file from one format to another, such as MOV to MP4, so it plays correctly on the device or platform you need.",
    category: "video-tools",
    engine: "video-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".mp4", ".mov", ".avi", ".mkv", ".webm"],
    isLive: false,
    faqs: [
      { question: "Which formats can I convert between?", answer: "MP4, MOV, AVI, MKV, and WebM are planned as supported formats." },
    ],
  },
  {
    slug: "video-to-gif",
    name: "Video to GIF",
    shortDescription: "Turn a video clip into a looping GIF.",
    longDescription:
      "Video to GIF converts a short video segment into an animated GIF, ready to share on chat apps and social media.",
    category: "video-tools",
    engine: "video-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".mp4", ".mov"],
    isLive: false,
    faqs: [
      { question: "Is there a maximum GIF length?", answer: "Short clips work best for file size; a recommended max length will be shown in the tool." },
    ],
  },
  {
    slug: "video-resizer",
    name: "Video Resizer",
    shortDescription: "Resize video resolution for different platforms.",
    longDescription:
      "Video Resizer changes the resolution and aspect ratio of a video, helpful for fitting platform-specific requirements like square or vertical formats.",
    category: "video-tools",
    engine: "video-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".mp4", ".mov"],
    isLive: false,
    faqs: [
      { question: "Will it support vertical and square formats?", answer: "Common presets for vertical, square, and widescreen are planned." },
    ],
  },
  {
    slug: "video-merger",
    name: "Merge Video",
    shortDescription: "Combine multiple video clips into one file.",
    longDescription:
      "Merge Video joins several video clips together in sequence to produce a single combined video file.",
    category: "video-tools",
    engine: "video-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".mp4", ".mov"],
    isLive: false,
    faqs: [
      { question: "Do clips need to be the same resolution?", answer: "Mixed resolutions will be auto-matched to the first clip in the sequence." },
    ],
  },
  {
    slug: "video-watermark",
    name: "Add Watermark to Video",
    shortDescription: "Overlay a logo or text watermark on a video.",
    longDescription:
      "Add Watermark to Video places a logo image or text label onto your video at a chosen position, useful for branding shared content.",
    category: "video-tools",
    engine: "video-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".mp4", ".mov"],
    isLive: false,
    faqs: [
      { question: "Can I control the watermark position and opacity?", answer: "Position presets and an opacity slider are planned for the tool." },
    ],
  },
];
