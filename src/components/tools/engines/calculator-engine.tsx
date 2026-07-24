"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function NumberField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="decimal"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function ResultBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-primary-soft px-5 py-4 text-center">
      <p className="font-display text-2xl font-bold text-primary">{children}</p>
    </div>
  );
}

function PercentageCalculator() {
  const [a, setA] = React.useState("");
  const [b, setB] = React.useState("");
  const x = parseFloat(a);
  const y = parseFloat(b);
  const valid = !isNaN(x) && !isNaN(y) && y !== 0;
  const result = valid ? ((x / y) * 100).toFixed(2) : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField label="What is" value={a} onChange={setA} />
        <NumberField label="Percent of" value={b} onChange={setB} />
      </div>
      {result && <ResultBox>{a} is {result}% of {b}</ResultBox>}
    </div>
  );
}

function BmiCalculator() {
  const [height, setHeight] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const h = parseFloat(height) / 100;
  const w = parseFloat(weight);
  const valid = h > 0 && w > 0;
  const bmi = valid ? w / (h * h) : null;

  function category(bmi: number) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField label="Height" value={height} onChange={setHeight} suffix="cm" />
        <NumberField label="Weight" value={weight} onChange={setWeight} suffix="kg" />
      </div>
      {bmi && (
        <ResultBox>
          BMI: {bmi.toFixed(1)} — {category(bmi)}
        </ResultBox>
      )}
    </div>
  );
}

function AgeCalculator() {
  const [birthDate, setBirthDate] = React.useState("");
  const [targetDate, setTargetDate] = React.useState(
    new Date().toISOString().slice(0, 10)
  );

  let result: string | null = null;
  if (birthDate && targetDate) {
    const start = new Date(birthDate);
    const end = new Date(targetDate);
    if (end >= start) {
      let years = end.getFullYear() - start.getFullYear();
      let months = end.getMonth() - start.getMonth();
      let days = end.getDate() - start.getDate();
      if (days < 0) {
        months -= 1;
        days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }
      result = `${years} years, ${months} months, ${days} days`;
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Birth date</label>
          <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">As of date</label>
          <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
        </div>
      </div>
      {result && <ResultBox>{result}</ResultBox>}
    </div>
  );
}

function DiscountCalculator() {
  const [price, setPrice] = React.useState("");
  const [discount, setDiscount] = React.useState("");
  const p = parseFloat(price);
  const d = parseFloat(discount);
  const valid = p > 0 && d >= 0;
  const saved = valid ? (p * d) / 100 : null;
  const final = valid ? p - (saved ?? 0) : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField label="Original price" value={price} onChange={setPrice} suffix="$" />
        <NumberField label="Discount" value={discount} onChange={setDiscount} suffix="%" />
      </div>
      {final !== null && saved !== null && (
        <ResultBox>
          Final price: ${final.toFixed(2)} (save ${saved.toFixed(2)})
        </ResultBox>
      )}
    </div>
  );
}

function LoanEmiCalculator() {
  const [amount, setAmount] = React.useState("");
  const [rate, setRate] = React.useState("");
  const [term, setTerm] = React.useState("");

  const p = parseFloat(amount);
  const annualRate = parseFloat(rate);
  const months = parseFloat(term);
  const valid = p > 0 && annualRate >= 0 && months > 0;

  let emi: number | null = null;
  let totalInterest: number | null = null;
  if (valid) {
    const monthlyRate = annualRate / 12 / 100;
    if (monthlyRate === 0) {
      emi = p / months;
    } else {
      emi =
        (p * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);
    }
    totalInterest = emi * months - p;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <NumberField label="Loan amount" value={amount} onChange={setAmount} suffix="$" />
        <NumberField label="Interest rate (annual)" value={rate} onChange={setRate} suffix="%" />
        <NumberField label="Term" value={term} onChange={setTerm} suffix="months" />
      </div>
      {emi !== null && totalInterest !== null && (
        <ResultBox>
          Monthly EMI: ${emi.toFixed(2)} — Total interest: ${totalInterest.toFixed(2)}
        </ResultBox>
      )}
    </div>
  );
}

function GenericComingSoon() {
  return (
    <p className="rounded-xl bg-surface px-4 py-6 text-center text-sm text-muted-foreground">
      This calculator is being wired up. Try Percentage, BMI, Age, Discount,
      or Loan EMI in the meantime.
    </p>
  );
}

export function CalculatorEngine({ slug }: { slug: string }) {
  switch (slug) {
    case "percentage-calculator":
      return <PercentageCalculator />;
    case "bmi-calculator":
      return <BmiCalculator />;
    case "age-calculator":
      return <AgeCalculator />;
    case "discount-calculator":
      return <DiscountCalculator />;
    case "loan-emi-calculator":
      return <LoanEmiCalculator />;
    default:
      return <GenericComingSoon />;
  }
}
