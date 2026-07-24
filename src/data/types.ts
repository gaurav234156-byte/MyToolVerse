import type { CategorySlug } from "./categories";

/**
 * "engine" tells the tool page which interface/logic to mount.
 * - client engines run entirely in-browser (real, working).
 * - api engines are fully designed UIs wired to a stub function,
 *   ready to connect to a real backend/API later (clearly marked).
 */
export type ToolEngine =
  | "pdf-merge"
  | "pdf-split"
  | "pdf-compress"
  | "pdf-to-images"
  | "pdf-to-jpg"
  | "images-to-pdf"
  | "pdf-rotate"
  | "pdf-watermark"
  | "pdf-protect"
  | "pdf-unlock"
  | "pdf-crop"
  | "pdf-page-numbers"
  | "pdf-sign"
| "pdf-to-word"
| "word-to-pdf"
| "pdf-to-excel"
  | "pdf-generic"
  | "organize-pdf"
  | "excel-to-pdf"
  | "repair-pdf"
  | "edit-pdf"
  | "image-compress"
  | "image-resize"
  | "image-crop"
  | "image-convert"
  | "image-generic-api"
  | "text-case"
  | "text-counter"
  | "text-diff"
  | "text-generic"
  | "json-formatter"
  | "base64-encode"
  | "base64-decode"
  | "jwt-decode"
  | "uuid-generator"
  | "password-generator"
  | "qr-generator"
  | "hash-generator"
  | "url-encode"
  | "dev-generic"
  | "calculator-generic"
  | "ai-generic-api"
  | "video-generic-api"
  | "audio-generic-api"
  | "student-generic"
  | "business-generic";

export interface Tool {
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: CategorySlug;
  engine: ToolEngine;
  acceptsUpload: boolean;
  acceptedFormats?: string[];
  trending?: boolean;
  popular?: boolean;
  isLive: boolean; // true = fully working client-side tool, false = designed UI awaiting backend
  faqs: { question: string; answer: string }[];
}
