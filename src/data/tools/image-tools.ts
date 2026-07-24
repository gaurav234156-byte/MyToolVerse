import type { Tool } from "../types";

export const imageTools: Tool[] = [
  {
    slug: "compress-image",
    name: "Compress Image",
    shortDescription: "Reduce image file size without losing visible quality.",
    longDescription:
      "Compress Image shrinks JPG, PNG, and WebP files by optimizing pixel data, making them faster to upload and load while keeping them sharp.",
    category: "image-tools",
    engine: "image-compress",
    acceptsUpload: true,
    acceptedFormats: [".jpg", ".jpeg", ".png", ".webp"],
    trending: true,
    popular: true,
    isLive: true,
    faqs: [
      { question: "How much smaller will my image get?", answer: "Photos typically shrink 50-80% with little visible difference at normal viewing sizes." },
      { question: "Can I compress multiple images at once?", answer: "Yes, drop in several files and download them together as a ZIP." },
    ],
  },
  {
    slug: "resize-image",
    name: "Resize Image",
    shortDescription: "Change image dimensions by pixels, percentage, or preset.",
    longDescription:
      "Resize Image scales your photo up or down to exact pixel dimensions or a percentage, with an option to lock the aspect ratio so nothing looks stretched.",
    category: "image-tools",
    engine: "image-resize",
    acceptsUpload: true,
    acceptedFormats: [".jpg", ".jpeg", ".png", ".webp"],
    popular: true,
    isLive: true,
    faqs: [
      { question: "Will resizing distort my image?", answer: "Lock the aspect ratio toggle to keep proportions correct automatically." },
      { question: "What's the maximum size I can resize to?", answer: "You can scale up to 8000px on the longest edge, though upscaling beyond the original size may look soft." },
    ],
  },
  {
    slug: "crop-image",
    name: "Crop Image",
    shortDescription: "Cut an image down to a specific area or aspect ratio.",
    longDescription:
      "Crop Image gives you a draggable frame to select exactly the part of the photo you want to keep, with quick presets for square, portrait, and widescreen.",
    category: "image-tools",
    engine: "image-crop",
    acceptsUpload: true,
    acceptedFormats: [".jpg", ".jpeg", ".png", ".webp"],
    popular: true,
    isLive: true,
    faqs: [
      { question: "Are there preset aspect ratios?", answer: "Yes, including 1:1, 4:3, 16:9, and a free-form option." },
    ],
  },
  {
    slug: "png-to-jpg",
    name: "PNG to JPG",
    shortDescription: "Convert transparent PNGs into compact JPG files.",
    longDescription:
      "PNG to JPG converts your image format, filling transparent areas with a background color of your choice since JPG doesn't support transparency.",
    category: "image-tools",
    engine: "image-convert",
    acceptsUpload: true,
    acceptedFormats: [".png"],
    popular: true,
    isLive: true,
    faqs: [
      { question: "What happens to transparent backgrounds?", answer: "Transparent areas are filled with white by default, or a color you choose." },
    ],
  },
  {
    slug: "jpg-to-png",
    name: "JPG to PNG",
    shortDescription: "Convert JPG photos into lossless PNG format.",
    longDescription:
      "JPG to PNG converts your photo into PNG, useful when you need a format that supports transparency or want to avoid further compression artifacts.",
    category: "image-tools",
    engine: "image-convert",
    acceptsUpload: true,
    acceptedFormats: [".jpg", ".jpeg"],
    isLive: true,
    faqs: [
      { question: "Will the file size increase?", answer: "Usually yes, since PNG is lossless and doesn't compress photographic detail as tightly as JPG." },
    ],
  },
  {
    slug: "webp-to-png",
    name: "WebP to PNG",
    shortDescription: "Convert modern WebP images into widely-supported PNG.",
    longDescription:
      "WebP to PNG converts images saved in Google's WebP format into PNG, useful for older software or platforms that don't yet support WebP.",
    category: "image-tools",
    engine: "image-convert",
    acceptsUpload: true,
    acceptedFormats: [".webp"],
    isLive: true,
    faqs: [
      { question: "Does converting lose animation?", answer: "Animated WebP files convert to a static PNG of the first frame; use a video tool for animated output." },
    ],
  },
  {
    slug: "heic-to-jpg",
    name: "HEIC to JPG",
    shortDescription: "Convert iPhone HEIC photos into universal JPG format.",
    longDescription:
      "HEIC to JPG converts Apple's HEIC photo format into JPG, so your photos open correctly on Windows, Android, and older software.",
    category: "image-tools",
    engine: "image-convert",
    acceptsUpload: true,
    acceptedFormats: [".heic"],
    trending: true,
    isLive: false,
    faqs: [
      { question: "Does this work with Live Photos?", answer: "Only the still image is converted; the motion portion of a Live Photo isn't included." },
    ],
  },
  {
    slug: "background-remover",
    name: "Background Remover",
    shortDescription: "Cut out the background from any photo automatically.",
    longDescription:
      "Background Remover uses AI to detect the subject of your photo and erase the background, leaving a clean transparent PNG ready for product shots or profile pictures.",
    category: "image-tools",
    engine: "image-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".jpg", ".jpeg", ".png"],
    trending: true,
    popular: true,
    isLive: false,
    faqs: [
      { question: "Does this work on photos with multiple people?", answer: "Yes, the detection keeps all foreground subjects and removes the background behind them." },
      { question: "What format is the result?", answer: "You'll get a PNG with a transparent background so you can place it on anything." },
    ],
  },
  {
    slug: "image-upscaler",
    name: "Image Upscaler",
    shortDescription: "Increase image resolution using AI without losing sharpness.",
    longDescription:
      "Image Upscaler uses AI to enlarge low-resolution images while reconstructing fine detail, useful for old photos or small product images that need to look sharp larger.",
    category: "image-tools",
    engine: "image-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".jpg", ".jpeg", ".png"],
    trending: true,
    isLive: false,
    faqs: [
      { question: "How much larger can I make an image?", answer: "Up to 4x the original resolution, depending on the source image's starting quality." },
    ],
  },
  {
    slug: "rotate-image",
    name: "Rotate Image",
    shortDescription: "Turn a photo 90, 180, or 270 degrees, or flip it.",
    longDescription:
      "Rotate Image fixes sideways photos and lets you flip horizontally or vertically, with a live preview before you download.",
    category: "image-tools",
    engine: "image-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".jpg", ".jpeg", ".png", ".webp"],
    isLive: true,
    faqs: [
      { question: "Can I rotate by a custom angle?", answer: "Quick 90-degree steps are built in, plus a fine-rotation slider for any angle." },
    ],
  },
  {
    slug: "image-to-text-ocr",
    name: "Image to Text (OCR)",
    shortDescription: "Extract editable text from a photo or screenshot.",
    longDescription:
      "Image to Text reads the words inside a picture, like a screenshot or photographed page, and turns them into text you can copy and paste.",
    category: "image-tools",
    engine: "image-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".jpg", ".jpeg", ".png"],
    popular: true,
    isLive: false,
    faqs: [
      { question: "What languages are supported?", answer: "Major world languages are supported, with best accuracy on clear, well-lit text." },
    ],
  },
  {
    slug: "meme-generator",
    name: "Meme Generator",
    shortDescription: "Add bold top and bottom captions to any image.",
    longDescription:
      "Meme Generator places classic caption text on your image with adjustable size, stroke, and position, ready to download and share.",
    category: "image-tools",
    engine: "image-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".jpg", ".jpeg", ".png"],
    isLive: false,
    faqs: [
      { question: "Can I use my own font?", answer: "A classic meme font is built in, with a few alternative styles to choose from." },
    ],
  },
  {
    slug: "image-color-picker",
    name: "Image Color Picker",
    shortDescription: "Click anywhere on an image to get its exact color code.",
    longDescription:
      "Image Color Picker lets you upload a photo and click any pixel to instantly get its HEX, RGB, and HSL color values for design work.",
    category: "image-tools",
    engine: "image-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".jpg", ".jpeg", ".png", ".webp"],
    isLive: false,
    faqs: [
      { question: "Can I save multiple colors from one image?", answer: "Yes, every color you click is added to a palette list you can copy from." },
    ],
  },
  {
    slug: "image-to-base64",
    name: "Image to Base64",
    shortDescription: "Convert an image into a Base64 text string for code.",
    longDescription:
      "Image to Base64 encodes your image file as a Base64 string you can paste directly into HTML, CSS, or JSON without hosting a separate file.",
    category: "image-tools",
    engine: "image-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".jpg", ".jpeg", ".png", ".webp", ".svg"],
    isLive: true,
    faqs: [
      { question: "Does this work for large images?", answer: "It works for any size, but Base64 strings get long fast, so it's best for small icons and assets." },
    ],
  },
  {
    slug: "favicon-generator",
    name: "Favicon Generator",
    shortDescription: "Turn any image into a full favicon icon set.",
    longDescription:
      "Favicon Generator resizes your logo or image into every favicon size browsers and devices expect, packaged into one ready-to-use ZIP.",
    category: "image-tools",
    engine: "image-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".jpg", ".jpeg", ".png", ".svg"],
    isLive: false,
    faqs: [
      { question: "What sizes are included?", answer: "Standard sizes from 16x16 up to 512x512, plus an .ico file for legacy browser support." },
    ],
  },
  {
    slug: "image-watermark",
    name: "Image Watermark",
    shortDescription: "Stamp a text or logo watermark across your photos.",
    longDescription:
      "Image Watermark overlays your brand text or logo onto a photo with adjustable position, size, and transparency, protecting your work before sharing it.",
    category: "image-tools",
    engine: "image-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".jpg", ".jpeg", ".png"],
    isLive: true,
    faqs: [
      { question: "Can I apply the same watermark to many photos?", answer: "Yes, upload a batch and the same watermark settings apply to all of them." },
    ],
  },
  {
    slug: "gif-maker",
    name: "GIF Maker",
    shortDescription: "Turn a sequence of images into an animated GIF.",
    longDescription:
      "GIF Maker stitches your uploaded images together into a looping animated GIF, with control over frame delay and playback order.",
    category: "image-tools",
    engine: "image-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".jpg", ".jpeg", ".png"],
    isLive: false,
    faqs: [
      { question: "Is there a limit on the number of frames?", answer: "Up to 50 images can be combined into a single GIF." },
    ],
  },
  {
    slug: "image-to-pdf",
    name: "Image to PDF",
    shortDescription: "Convert any single image into a PDF document.",
    longDescription:
      "Image to PDF wraps a single photo or graphic into a one-page PDF, handy for submissions that require a PDF format specifically.",
    category: "image-tools",
    engine: "images-to-pdf",
    acceptsUpload: true,
    acceptedFormats: [".jpg", ".jpeg", ".png", ".webp"],
    isLive: true,
    faqs: [
      { question: "How is this different from JPG to PDF?", answer: "It works the same way; this version is just for converting a single image quickly." },
    ],
  },
  {
    slug: "blur-face",
    name: "Blur Face",
    shortDescription: "Automatically detect and blur faces in a photo.",
    longDescription:
      "Blur Face finds faces in an uploaded image and applies a blur over them, helpful for protecting privacy before posting a photo publicly.",
    category: "image-tools",
    engine: "image-generic-api",
    acceptsUpload: true,
    acceptedFormats: [".jpg", ".jpeg", ".png"],
    isLive: false,
    faqs: [
      { question: "Can I choose which faces to blur?", answer: "All detected faces are blurred by default; you can also manually add or remove blur regions." },
    ],
  },
  {
    slug: "image-compressor-bulk",
    name: "Bulk Image Compressor",
    shortDescription: "Compress dozens of images at once in a single batch.",
    longDescription:
      "Bulk Image Compressor processes an entire folder of images together, applying the same quality settings and packaging results into one ZIP download.",
    category: "image-tools",
    engine: "image-compress",
    acceptsUpload: true,
    acceptedFormats: [".jpg", ".jpeg", ".png", ".webp"],
    isLive: true,
    faqs: [
      { question: "How many images can I upload at once?", answer: "Up to 50 images per batch for smooth in-browser processing." },
    ],
  },
];
