import type { Tool } from "../types";

export const businessTools: Tool[] = [
  {
    slug: "invoice-generator",
    name: "Invoice Generator",
    shortDescription: "Create professional invoices to send to clients.",
    longDescription:
      "Invoice Generator builds a clean, professional invoice with your business details, line items, and totals, ready to download as a PDF and send to a client.",
    category: "business-tools",
    engine: "business-generic",
    acceptsUpload: false,
    trending: true,
    popular: true,
    isLive: false,
    faqs: [
      { question: "Can I add my own logo?", answer: "Logo upload is planned so invoices can carry your branding." },
      { question: "Can I save invoices for later?", answer: "Saving and re-editing past invoices is planned for account holders." },
    ],
  },
  {
    slug: "business-name-generator",
    name: "Business Name Generator",
    shortDescription: "Get name ideas based on your industry and keywords.",
    longDescription:
      "Business Name Generator suggests potential business names based on a keyword or industry you enter, useful for early-stage brainstorming.",
    category: "business-tools",
    engine: "business-generic",
    acceptsUpload: false,
    popular: true,
    isLive: false,
    faqs: [
      { question: "Does it check domain name availability?", answer: "Domain availability checking is a planned add-on to the name suggestions." },
    ],
  },
  {
    slug: "electronic-signature",
    name: "Electronic Signature",
    shortDescription: "Sign documents online without printing.",
    longDescription:
      "Electronic Signature lets you draw or type a signature and place it onto a document, so contracts and forms can be signed entirely online.",
    category: "business-tools",
    engine: "business-generic",
    acceptsUpload: true,
    acceptedFormats: [".pdf", ".docx"],
    trending: true,
    isLive: false,
    faqs: [
      { question: "Are electronic signatures legally binding?", answer: "In most jurisdictions, yes, but requirements vary, so check local regulations for your use case." },
    ],
  },
  {
    slug: "business-card-maker",
    name: "Business Card Maker",
    shortDescription: "Design a printable business card in minutes.",
    longDescription:
      "Business Card Maker provides editable templates so you can lay out your name, title, and contact details into a print-ready business card.",
    category: "business-tools",
    engine: "business-generic",
    acceptsUpload: false,
    isLive: false,
    faqs: [
      { question: "What print size does it export?", answer: "Standard business card dimensions with bleed are planned for export." },
    ],
  },
  {
    slug: "meeting-cost-calculator",
    name: "Meeting Cost Calculator",
    shortDescription: "See the real cost of a meeting based on attendees.",
    longDescription:
      "Meeting Cost Calculator estimates the cost of a meeting in real time based on attendee count, average salary, and meeting duration, making time costs visible.",
    category: "business-tools",
    engine: "business-generic",
    acceptsUpload: false,
    isLive: false,
    faqs: [
      { question: "Where does the salary data come from?", answer: "You enter an average hourly rate manually; no external salary data is used." },
    ],
  },
  {
    slug: "nda-template-generator",
    name: "NDA Template Generator",
    shortDescription: "Generate a basic non-disclosure agreement template.",
    longDescription:
      "NDA Template Generator fills in a standard non-disclosure agreement template with party names and terms, producing a starting document for legal review.",
    category: "business-tools",
    engine: "business-generic",
    acceptsUpload: false,
    isLive: false,
    faqs: [
      { question: "Is this a substitute for legal advice?", answer: "No, always have a qualified lawyer review any agreement before signing." },
    ],
  },
];
