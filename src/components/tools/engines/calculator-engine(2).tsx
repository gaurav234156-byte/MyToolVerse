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