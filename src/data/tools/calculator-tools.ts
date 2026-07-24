import type { Tool } from "../types";

export const calculatorTools: Tool[] = [
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    shortDescription: "Find percentages, increases, and decreases instantly.",
    longDescription:
      "Percentage Calculator handles the three common percentage problems: what is X% of Y, what percent is X of Y, and percentage change between two numbers. Enter your values and get the answer with the formula shown.",
    category: "calculator-tools",
    engine: "calculator-generic",
    acceptsUpload: false,
    trending: true,
    popular: true,
    isLive: true,
    faqs: [
      { question: "Can it calculate percentage increase and decrease?", answer: "Yes, switch to the change mode and enter your starting and ending values." },
      { question: "Does it handle negative numbers?", answer: "Yes, percentage change works correctly with negative starting or ending values." },
    ],
  },
  {
    slug: "bmi-calculator",
    name: "BMI Calculator",
    shortDescription: "Calculate body mass index from height and weight.",
    longDescription:
      "BMI Calculator works out body mass index using metric or imperial units and tells you which weight category it falls into, based on standard adult BMI ranges.",
    category: "calculator-tools",
    engine: "calculator-generic",
    acceptsUpload: false,
    popular: true,
    isLive: true,
    faqs: [
      { question: "Is BMI accurate for everyone?", answer: "BMI is a general screening measure and doesn't account for muscle mass, so it may be less accurate for athletes." },
      { question: "Can I use pounds and inches?", answer: "Yes, toggle to imperial units before entering your height and weight." },
    ],
  },
  {
    slug: "loan-emi-calculator",
    name: "Loan EMI Calculator",
    shortDescription: "Work out monthly loan payments and total interest.",
    longDescription:
      "Loan EMI Calculator estimates your equal monthly installment based on loan amount, interest rate, and term, and breaks down how much of your total repayment goes to interest.",
    category: "calculator-tools",
    engine: "calculator-generic",
    acceptsUpload: false,
    trending: true,
    isLive: true,
    faqs: [
      { question: "Does this include taxes or fees?", answer: "No, this calculates principal and interest only; check with your lender for additional fees." },
      { question: "Can I compare different loan terms?", answer: "Yes, change the term field and recalculate to see how it affects your monthly payment." },
    ],
  },
  {
    slug: "age-calculator",
    name: "Age Calculator",
    shortDescription: "Find exact age in years, months, and days.",
    longDescription:
      "Age Calculator works out the precise time between a birth date and any target date, broken down into years, months, and days, plus total days lived.",
    category: "calculator-tools",
    engine: "calculator-generic",
    acceptsUpload: false,
    popular: true,
    isLive: true,
    faqs: [
      { question: "Can I calculate age as of a future date?", answer: "Yes, set the target date to any date, past or future." },
    ],
  },
  {
    slug: "discount-calculator",
    name: "Discount Calculator",
    shortDescription: "Find the sale price after a percentage discount.",
    longDescription:
      "Discount Calculator takes an original price and discount percentage and shows the amount saved and the final price you'll pay.",
    category: "calculator-tools",
    engine: "calculator-generic",
    acceptsUpload: false,
    isLive: true,
    faqs: [
      { question: "Can I stack two discounts?", answer: "Calculate the first discount, then use the resulting price as the input for the second." },
    ],
  },
  {
    slug: "gpa-calculator-tool",
    name: "GPA Calculator",
    shortDescription: "Calculate grade point average from your course grades.",
    longDescription:
      "GPA Calculator converts letter grades and credit hours into a weighted grade point average using the standard 4.0 scale.",
    category: "calculator-tools",
    engine: "calculator-generic",
    acceptsUpload: false,
    isLive: false,
    faqs: [
      { question: "Does it support different GPA scales?", answer: "The standard 4.0 scale is supported, with other scales planned." },
    ],
  },
  {
    slug: "compound-interest-calculator",
    name: "Compound Interest Calculator",
    shortDescription: "Project investment growth with compounding interest.",
    longDescription:
      "Compound Interest Calculator estimates how an investment grows over time given a principal, interest rate, compounding frequency, and term.",
    category: "calculator-tools",
    engine: "calculator-generic",
    acceptsUpload: false,
    isLive: false,
    faqs: [
      { question: "Can I include monthly contributions?", answer: "This is on the roadmap for a future update." },
    ],
  },
  {
    slug: "mortgage-calculator",
    name: "Mortgage Calculator",
    shortDescription: "Estimate monthly mortgage payments.",
    longDescription:
      "Mortgage Calculator estimates monthly home loan payments based on home price, down payment, interest rate, and loan term.",
    category: "calculator-tools",
    engine: "calculator-generic",
    acceptsUpload: false,
    isLive: false,
    faqs: [
      { question: "Does this include property tax and insurance?", answer: "Not yet, this estimates principal and interest only." },
    ],
  },
  {
    slug: "tip-calculator",
    name: "Tip Calculator",
    shortDescription: "Split a bill and calculate the tip amount.",
    longDescription:
      "Tip Calculator works out the tip amount and per-person share for a bill, based on the tip percentage and number of people splitting it.",
    category: "calculator-tools",
    engine: "calculator-generic",
    acceptsUpload: false,
    isLive: false,
    faqs: [
      { question: "Can I split unevenly between people?", answer: "Even splitting is supported now; custom splits are planned." },
    ],
  },
  {
    slug: "unit-converter",
    name: "Unit Converter",
    shortDescription: "Convert length, weight, temperature, and more.",
    longDescription:
      "Unit Converter switches values between common measurement systems, covering length, weight, volume, and temperature units.",
    category: "calculator-tools",
    engine: "calculator-generic",
    acceptsUpload: false,
    popular: true,
    isLive: false,
    faqs: [
      { question: "Which unit categories are supported?", answer: "Length, weight, volume, and temperature, with more categories planned." },
    ],
  },
  {
    slug: "currency-converter",
    name: "Currency Converter",
    shortDescription: "Convert between world currencies.",
    longDescription:
      "Currency Converter converts an amount from one currency to another. Live exchange rates will connect once the backend service is enabled.",
    category: "calculator-tools",
    engine: "calculator-generic",
    acceptsUpload: false,
    isLive: false,
    faqs: [
      { question: "Are exchange rates live?", answer: "Live rates are coming soon; this interface is ready and waiting on the data feed." },
    ],
  },
];
