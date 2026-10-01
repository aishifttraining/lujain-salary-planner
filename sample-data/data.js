// Made-up example data for the Salary & Job Offer Planner.
// Loaded via a <script> tag (index.html can't fetch local .js/.json when opened by double-click).
const SAMPLE_OFFERS = {
  // Offer A figures are fixed: they must produce Net Salary = 8,596.87 SAR.
  offerA: {
    basicSalary: 7000,
    housingAllowance: 1750,
    transportAllowance: 700,
    deductionRate: 9.75,
    annualBonus: 5000,
    medicalTier: "basic",
    leaveDays: 21,
    commuteCost: 350,
    remoteDays: 4
  },
  offerB: {
    basicSalary: 9500,
    housingAllowance: 3000,
    transportAllowance: 500,
    deductionRate: 9.75,
    annualBonus: 8000,
    medicalTier: "premium",
    leaveDays: 25,
    commuteCost: 500,
    remoteDays: 0
  },
  // Shared bills & savings goal, applied to both offers for comparison.
  monthlyBills: 5000,
  savingsGoal: 15000
};

// Quick comparison presets (Level 4) — clearly-labelled DEMO figures only,
// not real government/private salary data. Both presets fill every field for
// both offers so the whole app (perks, commute, remote days) has something
// meaningful to show instantly.
const PRESET_GOV_PRIVATE = {
  offerA: {
    basicSalary: 6000,
    housingAllowance: 1500,
    transportAllowance: 500,
    deductionRate: 9.75,
    annualBonus: 3000,
    medicalTier: "premium",
    leaveDays: 30,
    commuteCost: 300,
    remoteDays: 0
  },
  offerB: {
    basicSalary: 8000,
    housingAllowance: 2000,
    transportAllowance: 600,
    deductionRate: 9.75,
    annualBonus: 10000,
    medicalTier: "basic",
    leaveDays: 21,
    commuteCost: 450,
    remoteDays: 4
  },
  monthlyBills: 5000,
  savingsGoal: 20000
};

const PRESET_REMOTE_ONSITE = {
  offerA: {
    basicSalary: 7500,
    housingAllowance: 1800,
    transportAllowance: 300,
    deductionRate: 9.75,
    annualBonus: 4000,
    medicalTier: "premium",
    leaveDays: 25,
    commuteCost: 50,
    remoteDays: 22
  },
  offerB: {
    basicSalary: 7500,
    housingAllowance: 1800,
    transportAllowance: 700,
    deductionRate: 9.75,
    annualBonus: 4000,
    medicalTier: "premium",
    leaveDays: 25,
    commuteCost: 600,
    remoteDays: 0
  },
  monthlyBills: 5000,
  savingsGoal: 15000
};
