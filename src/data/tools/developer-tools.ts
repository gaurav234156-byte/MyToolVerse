import type { Tool } from "../types";

export const developerTools: Tool[] = [
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    shortDescription: "Format, validate, and beautify messy JSON instantly.",
    longDescription:
      "JSON Formatter takes minified or malformed JSON and pretty-prints it with proper indentation, while flagging syntax errors with a clear message and location.",
    category: "developer-tools",
    engine: "json-formatter",
    acceptsUpload: false,
    trending: true,
    popular: true,
    isLive: true,
    faqs: [
      { question: "Does it validate my JSON too?", answer: "Yes, invalid JSON is flagged immediately with the line where the problem starts." },
      { question: "Can I minify instead of beautify?", answer: "Yes, there's a one-click toggle to collapse formatted JSON back to a single line." },
    ],
  },
  {
    slug: "base64-encoder",
    name: "Base64 Encoder",
    shortDescription: "Encode plain text into Base64 format.",
    longDescription:
      "Base64 Encoder converts any text you type into its Base64 representation, useful for embedding data in URLs, configs, or APIs.",
    category: "developer-tools",
    engine: "base64-encode",
    acceptsUpload: false,
    popular: true,
    isLive: true,
    faqs: [
      { question: "Can I encode special characters and emoji?", answer: "Yes, UTF-8 text including emoji and accented characters encodes correctly." },
    ],
  },
  {
    slug: "base64-decoder",
    name: "Base64 Decoder",
    shortDescription: "Decode Base64 text back into its original form.",
    longDescription:
      "Base64 Decoder reverses Base64-encoded strings back into readable text, so you can inspect tokens, config values, or encoded payloads.",
    category: "developer-tools",
    engine: "base64-decode",
    acceptsUpload: false,
    popular: true,
    isLive: true,
    faqs: [
      { question: "What happens if the input isn't valid Base64?", answer: "You'll get a clear error message telling you the string couldn't be decoded." },
    ],
  },
  {
    slug: "jwt-decoder",
    name: "JWT Decoder",
    shortDescription: "Inspect the header and payload of a JWT token.",
    longDescription:
      "JWT Decoder splits a JSON Web Token into its header, payload, and signature, displaying the decoded claims so you can debug auth issues quickly.",
    category: "developer-tools",
    engine: "jwt-decode",
    acceptsUpload: false,
    trending: true,
    isLive: true,
    faqs: [
      { question: "Does this verify the token's signature?", answer: "No, this only decodes the readable parts. Signature verification requires the secret key, which never leaves your server." },
      { question: "Is my token sent anywhere?", answer: "No, decoding happens entirely in your browser; the token is never transmitted." },
    ],
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    shortDescription: "Generate random v4 UUIDs for testing or seeding data.",
    longDescription:
      "UUID Generator creates one or many version-4 UUIDs instantly, formatted and ready to copy into code, databases, or test fixtures.",
    category: "developer-tools",
    engine: "uuid-generator",
    acceptsUpload: false,
    popular: true,
    isLive: true,
    faqs: [
      { question: "How many UUIDs can I generate at once?", answer: "Generate up to 100 at a time, each guaranteed unique within the batch." },
      { question: "Are these cryptographically random?", answer: "Yes, generation uses the browser's secure random number source." },
    ],
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    shortDescription: "Create strong, random passwords with custom rules.",
    longDescription:
      "Password Generator builds secure passwords using a length you choose and a mix of uppercase, lowercase, numbers, and symbols, with a strength indicator.",
    category: "developer-tools",
    engine: "password-generator",
    acceptsUpload: false,
    trending: true,
    popular: true,
    isLive: true,
    faqs: [
      { question: "Are generated passwords stored anywhere?", answer: "No, passwords are generated locally in your browser and never sent or saved." },
      { question: "What's a safe password length?", answer: "12 characters or more, mixing character types, is recommended for most accounts." },
    ],
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    shortDescription: "Turn any text or link into a scannable QR code.",
    longDescription:
      "QR Code Generator converts a URL, message, or contact detail into a QR code image you can download and print, with adjustable size and color.",
    category: "developer-tools",
    engine: "qr-generator",
    acceptsUpload: false,
    trending: true,
    popular: true,
    isLive: true,
    faqs: [
      { question: "Do QR codes expire?", answer: "No, a QR code just encodes data directly; it works for as long as the underlying link or text is valid." },
      { question: "Can I download it as an image?", answer: "Yes, download as PNG or SVG for print-quality results." },
    ],
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    shortDescription: "Generate MD5, SHA-1, and SHA-256 hashes of any text.",
    longDescription:
      "Hash Generator computes common cryptographic hashes from your input text, useful for checksums, cache busting, or verifying data integrity.",
    category: "developer-tools",
    engine: "hash-generator",
    acceptsUpload: false,
    popular: true,
    isLive: true,
    faqs: [
      { question: "Which hash algorithms are supported?", answer: "MD5, SHA-1, SHA-256, and SHA-512 are all generated at once from the same input." },
      { question: "Is MD5 secure for passwords?", answer: "No, MD5 is considered broken for security purposes; use it only for checksums, not password storage." },
    ],
  },
  {
    slug: "url-encoder-decoder",
    name: "URL Encoder / Decoder",
    shortDescription: "Encode or decode special characters in a URL.",
    longDescription:
      "URL Encoder/Decoder converts characters like spaces and symbols into percent-encoded form, or reverses already-encoded URLs back to readable text.",
    category: "developer-tools",
    engine: "url-encode",
    acceptsUpload: false,
    isLive: true,
    faqs: [
      { question: "When do I need to encode a URL?", answer: "Whenever a URL contains spaces, special characters, or non-ASCII text that needs to travel safely in a link." },
    ],
  },
  {
    slug: "html-formatter",
    name: "HTML Formatter",
    shortDescription: "Beautify minified or messy HTML markup.",
    longDescription:
      "HTML Formatter re-indents your markup with consistent spacing and line breaks, making nested tags easy to read and debug.",
    category: "developer-tools",
    engine: "dev-generic",
    acceptsUpload: false,
    isLive: true,
    faqs: [
      { question: "Does it fix broken HTML tags?", answer: "It formats valid structure; severely broken markup may need manual correction first." },
    ],
  },
  {
    slug: "css-minifier",
    name: "CSS Minifier",
    shortDescription: "Compress CSS by removing whitespace and comments.",
    longDescription:
      "CSS Minifier strips unnecessary spacing, comments, and line breaks from your stylesheet, shrinking file size for faster page loads.",
    category: "developer-tools",
    engine: "dev-generic",
    acceptsUpload: false,
    isLive: true,
    faqs: [
      { question: "Will minifying break my CSS?", answer: "No, minifying only removes formatting characters, not functional code." },
    ],
  },
  {
    slug: "js-minifier",
    name: "JavaScript Minifier",
    shortDescription: "Shrink JavaScript files by removing whitespace.",
    longDescription:
      "JavaScript Minifier reduces your script's file size by stripping comments and unnecessary whitespace, useful for quick production tweaks.",
    category: "developer-tools",
    engine: "dev-generic",
    acceptsUpload: false,
    isLive: true,
    faqs: [
      { question: "Does this rename variables too?", answer: "No, this performs basic whitespace minification only, not full variable mangling." },
    ],
  },
  {
    slug: "regex-tester",
    name: "Regex Tester",
    shortDescription: "Test regular expressions against sample text live.",
    longDescription:
      "Regex Tester highlights matches in your sample text as you type a pattern, with capture groups broken out so you can debug expressions fast.",
    category: "developer-tools",
    engine: "dev-generic",
    acceptsUpload: false,
    popular: true,
    isLive: true,
    faqs: [
      { question: "Which regex flavor does this use?", answer: "Standard JavaScript regex syntax, the same engine used in browsers and Node.js." },
    ],
  },
  {
    slug: "diff-checker",
    name: "Code Diff Checker",
    shortDescription: "Compare two code snippets and highlight differences.",
    longDescription:
      "Code Diff Checker lines up two blocks of code side by side, highlighting added and removed lines so you can spot changes at a glance.",
    category: "developer-tools",
    engine: "text-diff",
    acceptsUpload: false,
    isLive: true,
    faqs: [
      { question: "Does it ignore whitespace-only changes?", answer: "There's a toggle to ignore whitespace differences when comparing." },
    ],
  },
  {
    slug: "color-converter",
    name: "Color Converter",
    shortDescription: "Convert colors between HEX, RGB, HSL, and more.",
    longDescription:
      "Color Converter takes a color in any common format and instantly shows its equivalent in HEX, RGB, HSL, and CMYK, with a live swatch preview.",
    category: "developer-tools",
    engine: "dev-generic",
    acceptsUpload: false,
    isLive: true,
    faqs: [
      { question: "Can I pick a color visually instead of typing it?", answer: "Yes, a color picker is included alongside the text input." },
    ],
  },
  {
    slug: "cron-job-generator",
    name: "Cron Expression Generator",
    shortDescription: "Build and explain cron schedule expressions visually.",
    longDescription:
      "Cron Expression Generator lets you pick a schedule from dropdowns and outputs the matching cron string, plus a plain-English explanation of when it runs.",
    category: "developer-tools",
    engine: "dev-generic",
    acceptsUpload: false,
    isLive: true,
    faqs: [
      { question: "Does it support 5-field and 6-field cron?", answer: "Standard 5-field cron is supported, covering minute through weekday." },
    ],
  },
  {
    slug: "lorem-ipsum-generator",
    name: "Lorem Ipsum Generator",
    shortDescription: "Generate placeholder text for designs and mockups.",
    longDescription:
      "Lorem Ipsum Generator produces however many paragraphs, sentences, or words of classic filler text you need for layout testing.",
    category: "developer-tools",
    engine: "dev-generic",
    acceptsUpload: false,
    isLive: true,
    faqs: [
      { question: "Can I generate just a few words instead of paragraphs?", answer: "Yes, choose words, sentences, or paragraphs as your unit." },
    ],
  },
  {
    slug: "markdown-previewer",
    name: "Markdown Previewer",
    shortDescription: "Write Markdown and see the rendered output live.",
    longDescription:
      "Markdown Previewer shows a live, rendered preview next to your Markdown source, so you can check formatting before pasting it into a README or post.",
    category: "developer-tools",
    engine: "dev-generic",
    acceptsUpload: false,
    isLive: true,
    faqs: [
      { question: "Does it support tables and code blocks?", answer: "Yes, standard Markdown including tables, code blocks, and links renders correctly." },
    ],
  },
  {
    slug: "css-gradient-generator",
    name: "CSS Gradient Generator",
    shortDescription: "Design a gradient visually and copy the CSS code.",
    longDescription:
      "CSS Gradient Generator lets you pick colors and direction on a live preview, then copies out ready-to-use linear or radial gradient CSS.",
    category: "developer-tools",
    engine: "dev-generic",
    acceptsUpload: false,
    isLive: true,
    faqs: [
      { question: "Can I add more than two colors?", answer: "Yes, add as many color stops as you need along the gradient." },
    ],
  },
  {
    slug: "timestamp-converter",
    name: "Timestamp Converter",
    shortDescription: "Convert between Unix timestamps and readable dates.",
    longDescription:
      "Timestamp Converter switches between Unix epoch time and human-readable dates in any timezone, handy for debugging logs and APIs.",
    category: "developer-tools",
    engine: "dev-generic",
    acceptsUpload: false,
    isLive: true,
    faqs: [
      { question: "Does it support milliseconds?", answer: "Yes, the tool detects whether your timestamp is in seconds or milliseconds." },
    ],
  },
];
