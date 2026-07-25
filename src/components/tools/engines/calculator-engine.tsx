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

function GpaCalculator() {
  const GRADE_POINTS: Record<string, number> = {
    "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7, "D": 1.0, "F": 0,
  };
  const [courses, setCourses] = React.useState([{ credits: "", grade: "A" }]);

  function updateCourse(i: number, field: "credits" | "grade", value: string) {
    const next = [...courses];
    next[i] = { ...next[i], [field]: value };
    setCourses(next);
  }

  const totalCredits = courses.reduce((sum, c) => sum + (parseFloat(c.credits) || 0), 0);
  const totalPoints = courses.reduce(
    (sum, c) => sum + (parseFloat(c.credits) || 0) * GRADE_POINTS[c.grade],
    0
  );
  const gpa = totalCredits > 0 ? totalPoints / totalCredits : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        {courses.map((c, i) => (
          <div key={i} className="grid grid-cols-2 gap-3">
            <NumberField
              label={`Course ${i + 1} credits`}
              value={c.credits}
              onChange={(v) => updateCourse(i, "credits", v)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Grade</label>
              <select
                value={c.grade}
                onChange={(e) => updateCourse(i, "grade", e.target.value)}
                className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
              >
                {Object.keys(GRADE_POINTS).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => setCourses([...courses, { credits: "", grade: "A" }])}>
          Add course
        </Button>
        {courses.length > 1 && (
          <Button variant="secondary" size="sm" onClick={() => setCourses(courses.slice(0, -1))}>
            Remove last
          </Button>
        )}
      </div>
      {gpa !== null && totalCredits > 0 && <ResultBox>GPA: {gpa.toFixed(2)}</ResultBox>}
    </div>
  );
}

function CompoundInterestCalculator() {
  const [principal, setPrincipal] = React.useState("");
  const [rate, setRate] = React.useState("");
  const [years, setYears] = React.useState("");
  const [frequency, setFrequency] = React.useState("12");

  const p = parseFloat(principal);
  const r = parseFloat(rate) / 100;
  const t = parseFloat(years);
  const n = parseFloat(frequency);
  const valid = p > 0 && r >= 0 && t > 0 && n > 0;

  const futureValue = valid ? p * Math.pow(1 + r / n, n * t) : null;
  const interestEarned = futureValue !== null ? futureValue - p : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <NumberField label="Principal" value={principal} onChange={setPrincipal} suffix="$" />
        <NumberField label="Annual interest rate" value={rate} onChange={setRate} suffix="%" />
        <NumberField label="Years" value={years} onChange={setYears} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Compounding frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="1">Annually</option>
            <option value="4">Quarterly</option>
            <option value="12">Monthly</option>
            <option value="365">Daily</option>
          </select>
        </div>
      </div>
      {futureValue !== null && interestEarned !== null && (
        <ResultBox>
          Future value: ${futureValue.toFixed(2)} (interest earned: ${interestEarned.toFixed(2)})
        </ResultBox>
      )}
    </div>
  );
}

function MortgageCalculator() {
  const [amount, setAmount] = React.useState("");
  const [rate, setRate] = React.useState("");
  const [years, setYears] = React.useState("");

  const p = parseFloat(amount);
  const annualRate = parseFloat(rate);
  const termYears = parseFloat(years);
  const valid = p > 0 && annualRate >= 0 && termYears > 0;

  let monthlyPayment: number | null = null;
  let totalPaid: number | null = null;
  let totalInterest: number | null = null;
  if (valid) {
    const months = termYears * 12;
    const monthlyRate = annualRate / 12 / 100;
    monthlyPayment =
      monthlyRate === 0
        ? p / months
        : (p * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    totalPaid = monthlyPayment * months;
    totalInterest = totalPaid - p;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <NumberField label="Loan amount" value={amount} onChange={setAmount} suffix="$" />
        <NumberField label="Interest rate (annual)" value={rate} onChange={setRate} suffix="%" />
        <NumberField label="Term" value={years} onChange={setYears} suffix="years" />
      </div>
      {monthlyPayment !== null && totalInterest !== null && (
        <ResultBox>
          Monthly payment: ${monthlyPayment.toFixed(2)} — Total interest: ${totalInterest.toFixed(2)}
        </ResultBox>
      )}
    </div>
  );
}

function TipCalculator() {
  const [bill, setBill] = React.useState("");
  const [tipPercent, setTipPercent] = React.useState("15");
  const [people, setPeople] = React.useState("1");

  const b = parseFloat(bill);
  const tp = parseFloat(tipPercent);
  const numPeople = parseFloat(people) || 1;
  const valid = b > 0 && tp >= 0;

  const tipAmount = valid ? b * (tp / 100) : null;
  const total = valid ? b + (tipAmount || 0) : null;
  const perPerson = total !== null ? total / numPeople : null;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <NumberField label="Bill amount" value={bill} onChange={setBill} suffix="$" />
        <NumberField label="Tip" value={tipPercent} onChange={setTipPercent} suffix="%" />
        <NumberField label="Number of people" value={people} onChange={setPeople} />
      </div>
      {tipAmount !== null && total !== null && perPerson !== null && (
        <ResultBox>
          Tip: ${tipAmount.toFixed(2)} — Total: ${total.toFixed(2)} — Per person: ${perPerson.toFixed(2)}
        </ResultBox>
      )}
    </div>
  );
}

const UNIT_GROUPS: Record<string, Record<string, number>> = {
  length: { Meters: 1, Kilometers: 1000, Centimeters: 0.01, Miles: 1609.34, Yards: 0.9144, Feet: 0.3048, Inches: 0.0254 },
  weight: { Kilograms: 1, Grams: 0.001, Pounds: 0.453592, Ounces: 0.0283495 },
};

function UnitConverter() {
  const [category, setCategory] = React.useState<"length" | "weight" | "temperature">("length");
  const units = category === "temperature" ? ["Celsius", "Fahrenheit", "Kelvin"] : Object.keys(UNIT_GROUPS[category]);
  const [from, setFrom] = React.useState(units[0]);
  const [to, setTo] = React.useState(units[1]);
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    const newUnits = category === "temperature" ? ["Celsius", "Fahrenheit", "Kelvin"] : Object.keys(UNIT_GROUPS[category]);
    setFrom(newUnits[0]);
    setTo(newUnits[1]);
  }, [category]);

  function convertTemp(v: number, fromUnit: string, toUnit: string) {
    let celsius = v;
    if (fromUnit === "Fahrenheit") celsius = (v - 32) * (5 / 9);
    if (fromUnit === "Kelvin") celsius = v - 273.15;
    if (toUnit === "Celsius") return celsius;
    if (toUnit === "Fahrenheit") return celsius * (9 / 5) + 32;
    return celsius + 273.15;
  }

  const v = parseFloat(value);
  let result: number | null = null;
  if (!isNaN(v)) {
    if (category === "temperature") {
      result = convertTemp(v, from, to);
    } else {
      const table = UNIT_GROUPS[category];
      result = (v * table[from]) / table[to];
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as typeof category)}
          className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
        >
          <option value="length">Length</option>
          <option value="weight">Weight</option>
          <option value="temperature">Temperature</option>
        </select>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <NumberField label="Value" value={value} onChange={setValue} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">From</label>
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="h-11 rounded-xl border border-input bg-background px-3 text-sm">
            {units.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">To</label>
          <select value={to} onChange={(e) => setTo(e.target.value)} className="h-11 rounded-xl border border-input bg-background px-3 text-sm">
            {units.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>
      {result !== null && (
        <ResultBox>
          {value} {from} = {result.toFixed(4)} {to}
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
    case "gpa-calculator-tool":
      return <GpaCalculator />;
    case "compound-interest-calculator":
      return <CompoundInterestCalculator />;
    case "mortgage-calculator":
      return <MortgageCalculator />;
    case "tip-calculator":
      return <TipCalculator />;
case "unit-converter":
      return <UnitConverter />;
    default:
  
      return <GenericComingSoon />;
  }
}
