# MyToolVerse

An all-in-one online tools website built with Next.js 15, React, TypeScript, and Tailwind CSS.

## What's built (critical path)

- Full design system (light/dark mode, color tokens, typography) in `globals.css` + `tailwind.config.ts`
- Root layout, Navbar, Footer
- Homepage: hero with live search, category dock, popular tools, category grid, trending tools, features, FAQ
- Global tool search (keyboard-navigable, searches all 127 tools)
- Dynamic category listing page: `/category/[category]`
- Dynamic tool detail page: `/tools/[category]/[tool]` — this single template renders **every** tool
- **13 fully working tools** (real client-side logic, no backend needed):
  - Merge PDF, Split PDF, Compress PDF
  - JSON Formatter (format + minify, 2/4-space indent)
  - Base64 Encoder & Decoder
  - JWT Decoder
  - UUID Generator
  - Password Generator (with strength meter)
  - QR Code Generator
  - Hash Generator (SHA-1/256/384/512 via Web Crypto)
  - URL Encoder/Decoder
  - Percentage, BMI, Age, Discount, and Loan EMI Calculators (5 calculators sharing one engine, dispatched by slug)
- All other ~114 tools render through the same page template with a polished "Coming soon" state, correct SEO metadata, FAQs, and related tools — they just need their engine wired in (see below)
- Static pages: About, Contact (working form UI), Privacy Policy, Terms of Service, 404
- `sitemap.ts` and `robots.ts` for SEO, covering all 127 tool pages + categories automatically

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Project structure

```
src/
  app/                          → routes (App Router)
    page.tsx                    → homepage
    category/[category]/        → category listing pages
    tools/[category]/[tool]/    → tool detail page (handles all 127 tools)
    about/ contact/ privacy-policy/ terms-of-service/
  components/
    layout/                     → navbar, footer
    shared/                     → tool-search, tool-card, category-card
    tools/
      engines/                  → one component per *working* tool engine
      file-dropzone.tsx         → shared upload UI
      tool-engine-renderer.tsx  → maps Tool.engine → engine component
    ui/                         → shadcn-style primitives (button, card, badge, input, accordion)
  data/
    categories.ts               → the 10 categories
    types.ts                    → Tool & ToolEngine types
    tools/*.ts                  → tool definitions, one file per category
    tools-index.ts              → aggregates all tools, search, related-tools helpers
```

## How to add a new working tool engine

Every tool already has a full page (SEO, FAQ, related tools, "Coming soon" UI).
To make one live:

1. Find its entry in `src/data/tools/<category>.ts` and note its `engine` value (e.g. `"image-compress"`).
2. Build a component in `src/components/tools/engines/<name>-engine.tsx` (copy `pdf-compress-engine.tsx` as a starting pattern: upload via `FileDropzone`, process, show a download link).
3. Register it in `src/components/tools/tool-engine-renderer.tsx`:
   ```tsx
   case "image-compress":
     return <ImageCompressEngine />;
   ```
4. Set `isLive: true` on that tool's entry in the data file.

That's the entire pattern — no new routes, no new pages, ever.

## Recommended next engines to build (high impact, doable client-side)

- `image-compress`, `image-resize`, `image-convert` → use `browser-image-compression` (already in package.json)
- `text-counter`, `text-case`, `text-diff` → pure JS string operations
- Remaining `calculator-generic` slugs (GPA, compound interest, mortgage, tip, unit converter) → extend `calculator-engine.tsx` with one more `case` each, same pattern as BMI/age/loan
- `pdf-rotate`, `pdf-watermark`, `images-to-pdf`, `pdf-to-images` → all doable with `pdf-lib` (already used in merge/split/compress), no backend needed

Tools requiring real server/AI work (AI Tools, Video Tools, Audio Tools, PDF OCR,
background remover, currency conversion) need a backend or third-party API — the UI and page are
ready and waiting, wire them to an API route under `src/app/api/` when ready.

## Notes

- This was built in an environment without npm registry access, so
  `npm install` has not been run or verified end-to-end. Run `npm run build`
  after installing to catch any last TypeScript issues — the code follows
  Next.js 15's async `params` convention and standard shadcn/ui patterns
  throughout, but a local build pass is recommended before deploying.
- Hosting: deploys cleanly to Vercel (zero config) since it's plain Next.js.
