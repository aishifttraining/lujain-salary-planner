// Salary & Job Offer Planner — Level 4
// Everything here runs client-side only. Nothing is saved or sent anywhere
// except this browser's own localStorage.

const STORAGE_KEY = "offerPlannerState";
const OFFER_KEYS = ["A", "B"];
const FIELD_IDS = ["basicSalary", "housingAllowance", "transportAllowance", "deductionRate"];
const PERK_NUMERIC_IDS = ["annualBonus", "leaveDays"];
const COMMUTE_NUMERIC_IDS = ["commuteCost", "remoteDays"];
const TIER_RANK = { basic: 1, premium: 2, vip: 3 };
const TIER_KEY = { basic: "tierBasic", premium: "tierPremium", vip: "tierVip" };
const USD_RATE = 3.75; // Fixed rate: 1 USD = 3.75 SAR.

// Every money input the user can type into. A canonical SAR value is kept
// for each one (see `canonicalSar` below) so switching currency back and
// forth never drifts — only the *displayed* input value is converted.
const MONEY_INPUT_IDS = [
  "basicSalaryA", "basicSalaryB",
  "housingAllowanceA", "housingAllowanceB",
  "transportAllowanceA", "transportAllowanceB",
  "annualBonusA", "annualBonusB",
  "commuteCostA", "commuteCostB",
  "monthlyBills", "savingsGoal"
];

const TRANSLATIONS = {
  en: {
    brand: "Offer Planner",
    brandSubtitle: "Plan your next opportunity",
    eyebrow: "Salary Calculator",
    title: "Salary & Job Offer Planner",
    subtitle: "Compare two job offers side by side and see your estimated monthly take-home salary in real time.",
    loadExample: "Load Example",
    presetGovPrivate: "Government vs Private (Demo)",
    presetRemoteOnsite: "Fully Remote vs On-Site (Demo)",
    clearAll: "Clear All",
    printButton: "Download PDF / Print Summary",
    printHint: "Tip: in the print dialog, choose “Save as PDF”.",
    fixedRateNote: "1 USD = 3.75 SAR",
    currencySarLabel: "SAR",
    currencyUsdLabel: "USD",
    themeDarkLabel: "🌙 Dark",
    themeLightLabel: "☀️ Light",
    offerA: "Offer A",
    offerB: "Offer B",
    basicSalary: "Basic Salary",
    housingAllowance: "Housing Allowance",
    transportAllowance: "Transport Allowance",
    deductionRate: "GOSI Deduction Rate",
    winnerBadge: "🏆 Winning Offer",
    breakdownTitle: "Step-by-Step Breakdown",
    stepGrossLabel: "Gross Salary = Basic + Housing + Transport",
    stepDeductLabel: "GOSI Deduction = (Basic + Housing) × Rate",
    stepNetLabel: "Net Take-Home Pay = Gross − Deduction",
    perksTitle: "✨ Additional Perks",
    annualBonus: "Annual Bonus",
    medicalTier: "Medical Insurance",
    leaveDays: "Paid Annual Leave (days)",
    daysUnit: "days",
    tierBasic: "Basic",
    tierPremium: "Premium",
    tierVip: "VIP",
    annualTakeHome: "Annual Take-Home Value",
    billsSectionTitle: "Monthly Bills & Savings Goal",
    billsSectionHint: "Applied to both offers so you can see which one leaves you more room to save.",
    monthlyBills: "Monthly Bills & Commitments",
    savingsGoal: "Savings Goal",
    remainingIncome: "Remaining after Bills & Commute",
    commuteSectionTitle: "Commute & Remote Work",
    commuteSectionHint: "Optional — commute cost lowers each offer's own remaining income; remote days are compared as a lifestyle perk, not money.",
    commuteCost: "Monthly Commute / Fuel Cost",
    remoteDays: "Remote Work Days / Month",
    chartTitle: "Savings Growth Timeline",
    chartHint: "Projected cumulative savings over 12 months for both offers. Hover or tab through the chart for exact figures.",
    chartTableSummary: "Text summary (12-month savings table)",
    chartMonthLabel: "Month",
    chartPreparing: "Preparing your savings projection…",
    comparisonTitle: "Comparison",
    comparisonEmpty: "Enter both offers to see which one pays more.",
    currencyUnit: "SAR",
    winnerRemaining: (label, amount) => `${label} leaves <strong>${amount}</strong> more remaining income per month.`,
    tieRemaining: "Both offers leave the same remaining income after bills.",
    timelineReached: (label, months) => `${label} reaches your goal in <strong>${formatInt(months, currentLang)}</strong> month${months === 1 ? "" : "s"}.`,
    timelineCannotReach: (label) => `${label}: bills and commute leave nothing to save — this goal can't be reached yet.`,
    timelineNoGoal: "Set a savings goal above to see the timeline.",
    recommendationTitle: "Smart Recommendation",
    recEmpty: "Enter both offers to get a personalized recommendation.",
    recTie: "Both offers are financially equivalent overall — compare the perks above to decide.",
    recIntro: (label) => `<strong>${label} is recommended</strong>:`,
    recAnnualPct: (pct) => `it provides <strong>${formatInt(pct, currentLang)}%</strong> higher annual take-home value.`,
    recAnnualAbs: (amount) => `it provides <strong>${amount}</strong> more in annual take-home value.`,
    recFaster: (months) => `It also reaches your savings goal <strong>${formatInt(months, currentLang)}</strong> month${months === 1 ? "" : "s"} faster.`,
    recSlower: (months) => `though it reaches your savings goal <strong>${formatInt(months, currentLang)}</strong> month${months === 1 ? "" : "s"} slower.`,
    recSameTimeline: "and reaches your savings goal in the same time.",
    recWinnerCannotSave: (label) => `Note: ${label}'s bills and commute currently leave nothing to save toward your goal.`,
    recBothCannotSave: "Neither offer currently leaves enough after bills and commute to reach your savings goal.",
    recPerksBetter: (tier, days) => `It also offers <strong>${tier}</strong> medical insurance and <strong>${formatInt(days, currentLang)}</strong> paid leave days.`,
    recPerksCaveat: (label, tier, days) => `Note: ${label} offers better perks — ${tier} medical insurance and ${formatInt(days, currentLang)} paid leave days — worth weighing against the extra pay.`,
    recPerksMixed: (labelA, tierA, daysA, labelB, tierB, daysB) =>
      `Perks differ: ${labelA} offers ${tierA} insurance & ${formatInt(daysA, currentLang)} leave days, while ${labelB} offers ${tierB} insurance & ${formatInt(daysB, currentLang)} leave days.`,
    recRemoteBetter: (days) => `It also allows <strong>${formatInt(days, currentLang)}</strong> more remote workday${days === 1 ? "" : "s"} per month.`,
    recRemoteCaveat: (label, days) => `Note: ${label} allows <strong>${formatInt(days, currentLang)}</strong> more remote workday${days === 1 ? "" : "s"} per month, which may suit a more flexible lifestyle.`,
    footerNote: "All numbers stay in your browser. Nothing is saved or sent anywhere.",
    printTitle: "Salary & Job Offer Comparison",
    printSubtitle: "Generated by Offer Planner — figures stay on your device.",
    printLanguageRow: "Language",
    printCurrencyRow: "Currency",
    langSelfName: "English",
    printGross: "Gross Salary",
    printDeduction: "GOSI Deduction",
    printNet: "Net Monthly Salary",
    printTimeline: "Savings Timeline",
    printWinnerRow: "Recommended Offer",
    printRecommendationHeading: "Smart Recommendation"
  },
  ar: {
    brand: "مخطط العروض",
    brandSubtitle: "خطط لفرصتك القادمة",
    eyebrow: "حاسبة الراتب",
    title: "مخطط الراتب وعروض العمل",
    subtitle: "قارن بين عرضي عمل جنبًا إلى جنب وشاهد صافي راتبك الشهري المتوقع مباشرة.",
    loadExample: "تحميل مثال",
    presetGovPrivate: "حكومي مقابل خاص (نموذج تجريبي)",
    presetRemoteOnsite: "عن بُعد بالكامل مقابل حضوري (نموذج تجريبي)",
    clearAll: "مسح الكل",
    printButton: "تحميل PDF / طباعة الملخص",
    printHint: "نصيحة: من نافذة الطباعة، اختر «حفظ كملف PDF».",
    fixedRateNote: "1 دولار = 3.75 ريال",
    currencySarLabel: "ريال",
    currencyUsdLabel: "دولار",
    themeDarkLabel: "🌙 مظلم",
    themeLightLabel: "☀️ فاتح",
    offerA: "العرض أ",
    offerB: "العرض ب",
    basicSalary: "الراتب الأساسي",
    housingAllowance: "بدل السكن",
    transportAllowance: "بدل النقل",
    deductionRate: "نسبة استقطاع التأمينات (GOSI)",
    winnerBadge: "🏆 العرض الأفضل",
    breakdownTitle: "خطوات الحساب بالتفصيل",
    stepGrossLabel: "الراتب الإجمالي = الأساسي + السكن + النقل",
    stepDeductLabel: "استقطاع التأمينات = (الأساسي + السكن) × النسبة",
    stepNetLabel: "صافي الراتب = الإجمالي − الاستقطاع",
    perksTitle: "✨ مزايا إضافية",
    annualBonus: "المكافأة السنوية",
    medicalTier: "التأمين الطبي",
    leaveDays: "الإجازة السنوية المدفوعة (أيام)",
    daysUnit: "يوم",
    tierBasic: "أساسي",
    tierPremium: "بريميوم",
    tierVip: "VIP",
    annualTakeHome: "القيمة السنوية الصافية",
    billsSectionTitle: "الفواتير الشهرية وهدف الادخار",
    billsSectionHint: "تُطبَّق على العرضين معًا لمعرفة أيهما يترك لك مساحة أكبر للادخار.",
    monthlyBills: "الفواتير والالتزامات الشهرية",
    savingsGoal: "هدف الادخار",
    remainingIncome: "المتبقي بعد الفواتير والتنقل",
    commuteSectionTitle: "التنقل والعمل عن بُعد",
    commuteSectionHint: "اختياري — تكلفة التنقل تُخصم من الدخل المتبقي لكل عرض على حدة؛ أيام العمل عن بُعد تُقارَن كميزة نوعية لا كقيمة مالية.",
    commuteCost: "تكلفة التنقل / الوقود الشهرية",
    remoteDays: "أيام العمل عن بُعد شهريًا",
    chartTitle: "مخطط نمو الادخار",
    chartHint: "توقّع تراكمي للادخار خلال 12 شهرًا للعرضين. مرّر الفأرة أو تنقّل بلوحة المفاتيح لرؤية الأرقام الدقيقة.",
    chartTableSummary: "ملخص نصي (جدول ادخار 12 شهرًا)",
    chartMonthLabel: "الشهر",
    chartPreparing: "جارٍ إعداد توقعات الادخار…",
    comparisonTitle: "المقارنة",
    comparisonEmpty: "أدخل تفاصيل العرضين لمعرفة أيهما أعلى.",
    currencyUnit: "ريال",
    winnerRemaining: (label, amount) => `${label} يترك <strong>${amount}</strong> أكثر كدخل متبقٍ شهريًا.`,
    tieRemaining: "الدخل المتبقي بعد الفواتير متساوٍ في العرضين.",
    timelineReached: (label, months) => `${label} يحقق هدفك خلال <strong>${formatInt(months, currentLang)}</strong> شهر${months === 1 ? "" : "اً"}.`,
    timelineCannotReach: (label) => `${label}: الفواتير والتنقل تستهلك كل الدخل — لا يمكن تحقيق هذا الهدف حاليًا.`,
    timelineNoGoal: "حدد هدف ادخار أعلاه لمشاهدة الجدول الزمني.",
    recommendationTitle: "توصية ذكية",
    recEmpty: "أدخل تفاصيل العرضين للحصول على توصية مخصصة.",
    recTie: "العرضان متكافئان ماليًا بشكل عام — قارن المزايا أعلاه لاتخاذ القرار.",
    recIntro: (label) => `<strong>${label} هو الموصى به</strong>:`,
    recAnnualPct: (pct) => `يقدم قيمة سنوية صافية أعلى بنسبة <strong>${formatInt(pct, currentLang)}%</strong>.`,
    recAnnualAbs: (amount) => `يقدم <strong>${amount}</strong> أكثر في القيمة السنوية الصافية.`,
    recFaster: (months) => `كما يحقق هدف ادخارك أسرع بـ <strong>${formatInt(months, currentLang)}</strong> شهر.`,
    recSlower: (months) => `لكنه يحقق هدف الادخار أبطأ بـ <strong>${formatInt(months, currentLang)}</strong> شهر.`,
    recSameTimeline: "ويحقق هدف الادخار في نفس المدة.",
    recWinnerCannotSave: (label) => `ملاحظة: فواتير وتنقل ${label} تستهلك كل الدخل حاليًا ولا تترك شيئًا لتحقيق هدفك.`,
    recBothCannotSave: "لا يترك أي من العرضين حاليًا دخلاً كافيًا بعد الفواتير والتنقل لتحقيق هدف الادخار.",
    recPerksBetter: (tier, days) => `كما يقدم تأمينًا طبيًا <strong>${tier}</strong> و<strong>${formatInt(days, currentLang)}</strong> يوم إجازة مدفوعة.`,
    recPerksCaveat: (label, tier, days) => `ملاحظة: يقدم ${label} مزايا أفضل — تأمين ${tier} و${formatInt(days, currentLang)} يوم إجازة — يستحق موازنتها مقابل الراتب الأعلى.`,
    recPerksMixed: (labelA, tierA, daysA, labelB, tierB, daysB) =>
      `تختلف المزايا: ${labelA} يقدم تأمين ${tierA} و${formatInt(daysA, currentLang)} يوم إجازة، بينما ${labelB} يقدم تأمين ${tierB} و${formatInt(daysB, currentLang)} يوم إجازة.`,
    recRemoteBetter: (days) => `كما يتيح <strong>${formatInt(days, currentLang)}</strong> يوم عمل عن بُعد إضافية شهريًا.`,
    recRemoteCaveat: (label, days) => `ملاحظة: يتيح ${label} <strong>${formatInt(days, currentLang)}</strong> يوم عمل عن بُعد إضافية شهريًا، وهو ما يناسب أسلوب حياة أكثر مرونة.`,
    footerNote: "كل الأرقام تبقى في متصفحك. لا يتم حفظ أو إرسال شيء.",
    printTitle: "مقارنة الراتب وعروض العمل",
    printSubtitle: "تم إنشاؤها بواسطة مخطط العروض — الأرقام تبقى على جهازك.",
    printLanguageRow: "اللغة",
    printCurrencyRow: "العملة",
    langSelfName: "العربية",
    printGross: "الراتب الإجمالي",
    printDeduction: "استقطاع التأمينات",
    printNet: "صافي الراتب الشهري",
    printTimeline: "الجدول الزمني للادخار",
    printWinnerRow: "العرض الموصى به",
    printRecommendationHeading: "التوصية الذكية"
  }
};

let currentLang = "en";
let currentCurrency = "SAR"; // "SAR" | "USD" — which currency is currently displayed/edited
let currentTheme = "dark"; // "dark" | "light"
let previousWinnerOffer = null; // tracks the last comparison winner, so mascots only react to a genuine change

// The single source of truth for every money field, always in SAR, at full
// precision (never rounded here). Only the input's *displayed* value gets
// rounded/converted for the active currency — repeated SAR/USD toggling
// re-derives the display from this untouched value, so nothing drifts.
let canonicalSar = {};

function setCanonical(id, sarValue) {
  canonicalSar[id] = Number(sarValue) || 0;
}

function getCanonical(id) {
  return canonicalSar[id] || 0;
}

// Truncate (not round) to 2 decimals so results match exact payroll figures.
function truncate2(num) {
  return Math.floor(num * 100 + 1e-9) / 100;
}

// Real locale formatting (Intl.NumberFormat) instead of a hardcoded "en-US" —
// this is what actually makes Arabic mode render Arabic-Indic digits
// (e.g. ٨٬٥٩٦٫٨٧), not just translated labels around Western digits.
function localeTag(lang) {
  return (lang || currentLang) === "ar" ? "ar-SA" : "en-US";
}

function formatNumber(num, lang) {
  return new Intl.NumberFormat(localeTag(lang), {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(truncate2(num));
}

// Whole-number counts (leave days, remote days, months, chart month ticks) —
// still locale-formatted, but never run through currency conversion.
function formatInt(num, lang) {
  return new Intl.NumberFormat(localeTag(lang)).format(Math.round(num));
}

// `amountSar` is always the true internal value in SAR. Only the *display*
// converts to USD at the fixed 1 USD = 3.75 SAR rate; nothing stored changes.
function convertedAmount(amountSar) {
  return currentCurrency === "USD" ? amountSar / USD_RATE : amountSar;
}

// Converted + locale-formatted number, with no currency unit attached —
// used inside formula strings (e.g. "7,000.00 + 1,750.00 + 700.00").
function formatAmt(amountSar, lang) {
  return formatNumber(convertedAmount(amountSar), lang);
}

function formatMoney(amountSar, lang) {
  const t = TRANSLATIONS[lang || currentLang];
  const formatted = formatAmt(amountSar, lang);
  if (currentCurrency === "USD") {
    return (lang || currentLang) === "ar" ? `${formatted} $` : `$${formatted}`;
  }
  return `${formatted} ${t.currencyUnit}`;
}

function tierLabel(tierValue, lang) {
  const key = TIER_KEY[tierValue] || TIER_KEY.basic;
  return TRANSLATIONS[lang][key];
}

// Rewrites every money input's *displayed* value from the canonical SAR
// figure, converted into whichever currency is currently active. Never
// touches `canonicalSar` itself, so this can run any number of times
// (currency toggle, language toggle, loading data) without any drift.
function refreshMoneyInputsDisplay() {
  MONEY_INPUT_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const sar = getCanonical(id);
    const displayVal = convertedAmount(sar);
    const rounded = Math.round(displayVal * 100) / 100;
    el.value = rounded;
  });
}

// The little "SAR" / "$" unit label shown right after each money input.
function updateCurrencySuffixes() {
  const t = TRANSLATIONS[currentLang];
  const label = currentCurrency === "USD" ? t.currencyUsdLabel : t.currencyUnit;
  document.querySelectorAll(".currency-suffix").forEach((el) => {
    el.textContent = label;
  });
}

function setText(el, text) {
  if (el.textContent === text) return;
  el.textContent = text;
  el.classList.remove("pulse");
  // restart the animation even if it was already mid-flight
  void el.offsetWidth;
  el.classList.add("pulse");
}

// Money fields (basicSalary, housingAllowance, transportAllowance, annualBonus,
// commuteCost) always come from the canonical SAR store, never from the
// input's displayed (possibly USD-converted) value. deductionRate is a
// percentage, and leaveDays/remoteDays are day counts — neither is money,
// so both are read straight off the input, untouched by currency.
function getOfferInputs(offer) {
  const values = {};
  FIELD_IDS.forEach((field) => {
    if (field === "deductionRate") {
      values[field] = Number(document.getElementById(`${field}${offer}`).value) || 0;
    } else {
      values[field] = getCanonical(`${field}${offer}`);
    }
  });
  return values;
}

// `data` is always in SAR (sample data, presets, saved state). Sets the
// canonical value for money fields and refreshes the visible input via
// refreshMoneyInputsDisplay() (called by the caller after all fields are set).
function setOfferInputs(offer, data) {
  FIELD_IDS.forEach((field) => {
    if (field === "deductionRate") {
      document.getElementById(`${field}${offer}`).value = data[field] ?? 0;
    } else {
      setCanonical(`${field}${offer}`, data[field] ?? 0);
    }
  });
}

function getPerkInputs(offer) {
  return {
    medicalTier: document.getElementById(`medicalTier${offer}`).value || "basic",
    annualBonus: getCanonical(`annualBonus${offer}`),
    leaveDays: Number(document.getElementById(`leaveDays${offer}`).value) || 0
  };
}

function setPerkInputs(offer, data) {
  document.getElementById(`medicalTier${offer}`).value = data.medicalTier ?? "basic";
  setCanonical(`annualBonus${offer}`, data.annualBonus ?? 0);
  document.getElementById(`leaveDays${offer}`).value = data.leaveDays ?? 0;
}

function getCommuteInputs(offer) {
  return {
    commuteCost: getCanonical(`commuteCost${offer}`),
    remoteDays: Number(document.getElementById(`remoteDays${offer}`).value) || 0
  };
}

function setCommuteInputs(offer, data) {
  setCanonical(`commuteCost${offer}`, data.commuteCost ?? 0);
  document.getElementById(`remoteDays${offer}`).value = data.remoteDays ?? 0;
}

// GOSI-style deduction: applied to basic + housing only, not transport.
// Each offer reads only its own suffixed inputs, so A and B never affect each other.
function calcOffer(offer) {
  const { basicSalary, housingAllowance, transportAllowance, deductionRate } = getOfferInputs(offer);
  const gross = basicSalary + housingAllowance + transportAllowance;
  const deduction = (basicSalary + housingAllowance) * (deductionRate / 100);
  const net = gross - deduction;

  document.getElementById(`grossFormula${offer}`).textContent =
    `${formatAmt(basicSalary)} + ${formatAmt(housingAllowance)} + ${formatAmt(transportAllowance)}`;
  document.getElementById(`deductFormula${offer}`).textContent =
    `(${formatAmt(basicSalary + housingAllowance)}) × ${formatNumber(deductionRate)}%`;
  document.getElementById(`netFormula${offer}`).textContent =
    `${formatAmt(gross)} − ${formatAmt(deduction)}`;

  setText(document.getElementById(`gross${offer}`), formatMoney(gross, currentLang));
  setText(document.getElementById(`deduct${offer}`), formatMoney(deduction, currentLang));
  setText(document.getElementById(`net${offer}`), formatMoney(net, currentLang));

  return {
    inputs: { basicSalary, housingAllowance, transportAllowance, deductionRate },
    gross: truncate2(gross),
    deduction: truncate2(deduction),
    net: truncate2(net)
  };
}

// Annual Take-Home Value = (Monthly Net Salary × 12) + Annual Bonus.
function calcPerks(offer, net) {
  const perks = getPerkInputs(offer);
  const annual = truncate2(net * 12 + perks.annualBonus);

  document.getElementById(`annualFormula${offer}`).textContent =
    `(${formatAmt(net)} × 12) + ${formatAmt(perks.annualBonus)}`;
  setText(document.getElementById(`annual${offer}`), formatMoney(annual, currentLang));

  return { annual, ...perks };
}

// Remaining Income After Bills and Commute = Net Salary - Monthly Bills - that offer's Commute Cost.
function calcSavingsColumn(offer, net, monthlyBills, commuteCost, savingsGoal) {
  const t = TRANSLATIONS[currentLang];
  const remaining = truncate2(net - monthlyBills - commuteCost);
  const label = t[`offer${offer}`];

  setText(document.getElementById(`remaining${offer}`), formatMoney(remaining, currentLang));

  const timelineEl = document.getElementById(`timeline${offer}`);
  timelineEl.classList.remove("warning");

  let months = null;
  if (savingsGoal <= 0) {
    timelineEl.innerHTML = t.timelineNoGoal;
  } else if (remaining <= 0) {
    timelineEl.innerHTML = t.timelineCannotReach(label);
    timelineEl.classList.add("warning");
  } else {
    months = Math.ceil(truncate2(savingsGoal / remaining) - 1e-9);
    timelineEl.innerHTML = t.timelineReached(label, months);
  }

  return { remaining, months };
}

function updateComparison(netA, netB, remainingA, remainingB) {
  const t = TRANSLATIONS[currentLang];
  const summaryEl = document.getElementById("comparisonSummary");

  const cardA = document.querySelector('.input-card[data-offer="A"]');
  const cardB = document.querySelector('.input-card[data-offer="B"]');
  const barRowA = document.getElementById("barRowA");
  const barRowB = document.getElementById("barRowB");

  cardA.classList.remove("is-winner");
  cardB.classList.remove("is-winner");
  barRowA.classList.remove("is-winner");
  barRowB.classList.remove("is-winner");

  const nothingEntered = netA === 0 && netB === 0;
  let winnerNow = null;

  if (nothingEntered) {
    summaryEl.innerHTML = t.comparisonEmpty;
  } else {
    const diff = truncate2(Math.abs(remainingA - remainingB));
    if (diff === 0) {
      summaryEl.innerHTML = t.tieRemaining;
    } else if (remainingA > remainingB) {
      winnerNow = "A";
      summaryEl.innerHTML = t.winnerRemaining(t.offerA, formatMoney(diff, currentLang));
      cardA.classList.add("is-winner");
      barRowA.classList.add("is-winner");
    } else {
      winnerNow = "B";
      summaryEl.innerHTML = t.winnerRemaining(t.offerB, formatMoney(diff, currentLang));
      cardB.classList.add("is-winner");
      barRowB.classList.add("is-winner");
    }
  }

  // A genuinely new winner just emerged (not merely re-confirmed on every
  // recalc) -> a satisfied "^__^" moment for the mascots.
  if (winnerNow && winnerNow !== previousWinnerOffer) {
    triggerReaction(mascotEls, "satisfaction");
  }
  previousWinnerOffer = winnerNow;

  // Progress bars: normalize against the larger magnitude so the winner
  // reads as a fuller bar, and negative remaining income shows red.
  const maxAbs = Math.max(Math.abs(remainingA), Math.abs(remainingB), 1);
  [
    { offer: "A", value: remainingA },
    { offer: "B", value: remainingB }
  ].forEach(({ offer, value }) => {
    const fillEl = document.getElementById(`barFill${offer}`);
    const width = Math.min(100, (Math.abs(value) / maxAbs) * 100);
    fillEl.style.width = `${nothingEntered ? 0 : width}%`;
    fillEl.classList.toggle("negative", value < 0);
    setText(document.getElementById(`barValue${offer}`), formatMoney(value, currentLang));
  });
}

// Checks whether set `a` is at least as good as `b` on both dimensions,
// and strictly better on at least one — i.e. a clear (non-mixed) advantage.
function perksDominate(a, b) {
  const rankA = TIER_RANK[a.medicalTier] || 1;
  const rankB = TIER_RANK[b.medicalTier] || 1;
  return rankA >= rankB && a.leaveDays >= b.leaveDays && (rankA > rankB || a.leaveDays > b.leaveDays);
}

function buildRecommendation({
  netA, netB, remainingA, remainingB, monthsA, monthsB, perksA, perksB, savingsGoal, remoteDaysA, remoteDaysB
}) {
  const t = TRANSLATIONS[currentLang];
  const el = document.getElementById("recommendationText");

  if (netA === 0 && netB === 0) {
    el.innerHTML = t.recEmpty;
    return { winner: null, text: t.recEmpty };
  }

  const annualA = perksA.annual;
  const annualB = perksB.annual;

  let winner = null;
  if (annualA !== annualB) {
    winner = annualA > annualB ? "A" : "B";
  } else if (remainingA !== remainingB) {
    winner = remainingA > remainingB ? "A" : "B";
  }

  if (!winner) {
    el.innerHTML = t.recTie;
    return { winner: null, text: t.recTie };
  }

  const loser = winner === "A" ? "B" : "A";
  const winnerLabel = t[`offer${winner}`];
  const loserLabel = t[`offer${loser}`];
  const winnerAnnual = winner === "A" ? annualA : annualB;
  const loserAnnual = winner === "A" ? annualB : annualA;
  const winnerMonths = winner === "A" ? monthsA : monthsB;
  const loserMonths = winner === "A" ? monthsB : monthsA;
  const winnerPerks = winner === "A" ? perksA : perksB;
  const loserPerks = winner === "A" ? perksB : perksA;
  const winnerRemoteDays = winner === "A" ? remoteDaysA : remoteDaysB;
  const loserRemoteDays = winner === "A" ? remoteDaysB : remoteDaysA;

  const parts = [t.recIntro(winnerLabel)];

  const annualDiff = truncate2(winnerAnnual - loserAnnual);
  if (annualDiff > 0) {
    if (loserAnnual > 0) {
      const pct = Math.round((annualDiff / loserAnnual) * 100);
      parts.push(t.recAnnualPct(pct));
    } else {
      parts.push(t.recAnnualAbs(formatMoney(annualDiff, currentLang)));
    }
  }

  if (savingsGoal > 0) {
    if (winnerMonths != null && loserMonths != null) {
      const diffMonths = loserMonths - winnerMonths;
      if (diffMonths > 0) parts.push(t.recFaster(diffMonths));
      else if (diffMonths < 0) parts.push(t.recSlower(Math.abs(diffMonths)));
      else parts.push(t.recSameTimeline);
    } else if (winnerMonths == null && loserMonths != null) {
      parts.push(t.recWinnerCannotSave(winnerLabel));
    } else if (winnerMonths == null && loserMonths == null) {
      parts.push(t.recBothCannotSave);
    }
  }

  if (perksDominate(winnerPerks, loserPerks)) {
    parts.push(t.recPerksBetter(tierLabel(winnerPerks.medicalTier, currentLang), winnerPerks.leaveDays));
  } else if (perksDominate(loserPerks, winnerPerks)) {
    parts.push(t.recPerksCaveat(loserLabel, tierLabel(loserPerks.medicalTier, currentLang), loserPerks.leaveDays));
  } else if (
    winnerPerks.medicalTier !== loserPerks.medicalTier ||
    winnerPerks.leaveDays !== loserPerks.leaveDays
  ) {
    parts.push(
      t.recPerksMixed(
        winnerLabel,
        tierLabel(winnerPerks.medicalTier, currentLang),
        winnerPerks.leaveDays,
        loserLabel,
        tierLabel(loserPerks.medicalTier, currentLang),
        loserPerks.leaveDays
      )
    );
  }

  // Remote work days: purely qualitative — never turned into a fake SAR value.
  if (winnerRemoteDays > loserRemoteDays) {
    parts.push(t.recRemoteBetter(winnerRemoteDays - loserRemoteDays));
  } else if (loserRemoteDays > winnerRemoteDays) {
    parts.push(t.recRemoteCaveat(loserLabel, loserRemoteDays - winnerRemoteDays));
  }

  const text = parts.join(" ");
  el.innerHTML = text;
  return { winner, winnerLabel, text };
}

function buildTooltipText(month, savingsA, savingsB, goal) {
  const t = TRANSLATIONS[currentLang];
  let text = `${t.chartMonthLabel} ${formatInt(month, currentLang)} — ${t.offerA}: ${formatMoney(savingsA, currentLang)}, ${t.offerB}: ${formatMoney(savingsB, currentLang)}`;
  if (goal > 0) text += `, ${t.savingsGoal}: ${formatMoney(goal, currentLang)}`;
  return text;
}

function buildSavingsTableHTML(months, valuesA, valuesB, goal) {
  const t = TRANSLATIONS[currentLang];
  const head = `<tr><th>${t.chartMonthLabel}</th>${months.map((i) => `<th>${formatInt(i, currentLang)}</th>`).join("")}</tr>`;
  const rowA = `<tr><th>${t.offerA}</th>${valuesA.map((v) => `<td>${formatMoney(v, currentLang)}</td>`).join("")}</tr>`;
  const rowB = `<tr><th>${t.offerB}</th>${valuesB.map((v) => `<td>${formatMoney(v, currentLang)}</td>`).join("")}</tr>`;
  const rowGoal = goal > 0
    ? `<tr><th>${t.savingsGoal}</th>${months.map(() => `<td>${formatMoney(goal, currentLang)}</td>`).join("")}</tr>`
    : "";
  return `<table>${head}${rowA}${rowB}${rowGoal}</table>`;
}

// Cumulative savings growth over 12 months for both offers:
// monthly savings = Net Salary - Monthly Bills - that offer's Commute Cost.
// Renders an inline SVG line chart plus an accessible text-summary table.
function buildSavingsChart({ netA, netB, monthlyBills, commuteA, commuteB, savingsGoal }) {
  const t = TRANSLATIONS[currentLang];
  const monthlyA = truncate2(netA - monthlyBills - commuteA);
  const monthlyB = truncate2(netB - monthlyBills - commuteB);
  const months = Array.from({ length: 13 }, (_, i) => i);
  const valuesA = months.map((i) => truncate2(monthlyA * i));
  const valuesB = months.map((i) => truncate2(monthlyB * i));

  const width = 600;
  const height = 260;
  const padLeft = 58;
  const padRight = 16;
  const padTop = 18;
  const padBottom = 34;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const rawMax = Math.max(1, savingsGoal, ...valuesA, ...valuesB);
  const rawMin = Math.min(0, ...valuesA, ...valuesB);
  const maxVal = rawMax * 1.12;
  const minVal = rawMin < 0 ? rawMin * 1.12 : 0;
  const range = maxVal - minVal || 1;

  const xAt = (i) => padLeft + (i / 12) * plotW;
  const yAt = (v) => padTop + plotH - ((v - minVal) / range) * plotH;

  const pointsA = valuesA.map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(" ");
  const pointsB = valuesB.map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(" ");

  const circles = months
    .map(
      (i) => `
    <circle class="chart-point" cx="${xAt(i).toFixed(1)}" cy="${yAt(valuesA[i]).toFixed(1)}" r="3.5" style="fill:var(--chart-a)"></circle>
    <circle class="chart-point" cx="${xAt(i).toFixed(1)}" cy="${yAt(valuesB[i]).toFixed(1)}" r="3.5" style="fill:var(--chart-b)"></circle>`
    )
    .join("");

  const goalLine =
    savingsGoal > 0
      ? `<line class="chart-goal-draw" x1="${padLeft}" y1="${yAt(savingsGoal).toFixed(1)}" x2="${width - padRight}" y2="${yAt(savingsGoal).toFixed(1)}" style="stroke:var(--chart-goal)" stroke-width="2" stroke-dasharray="6,4"></line>
    <text x="${width - padRight}" y="${(yAt(savingsGoal) - 6).toFixed(1)}" class="chart-axis-label chart-goal-label" text-anchor="end" style="fill:var(--chart-goal)">${t.savingsGoal}: ${formatAmt(savingsGoal, currentLang)}</text>`
      : "";

  const zeroLine =
    minVal < 0
      ? `<line x1="${padLeft}" y1="${yAt(0).toFixed(1)}" x2="${width - padRight}" y2="${yAt(0).toFixed(1)}" style="stroke:var(--card-border)" stroke-dasharray="2,3"></line>`
      : "";

  const hitWidth = plotW / 12;
  const hitRects = months
    .map((i) => {
      const hitX = xAt(i) - hitWidth / 2;
      const label = buildTooltipText(i, valuesA[i], valuesB[i], savingsGoal).replace(/"/g, "&quot;");
      return `<rect class="chart-hit" tabindex="0" role="img" aria-label="${label}" data-month="${i}" data-a="${valuesA[i]}" data-b="${valuesB[i]}" data-goal="${savingsGoal}" x="${hitX.toFixed(1)}" y="${padTop}" width="${hitWidth.toFixed(1)}" height="${plotH}"></rect>`;
    })
    .join("");

  const xLabels = months
    .filter((i) => i % 2 === 0)
    .map((i) => `<text x="${xAt(i).toFixed(1)}" y="${height - 10}" class="chart-axis-label" text-anchor="middle">${formatInt(i, currentLang)}</text>`)
    .join("");

  const yTicks = [minVal, minVal + range / 2, maxVal];
  const yLabels = yTicks
    .map(
      (v) =>
        `<text x="${padLeft - 8}" y="${yAt(v).toFixed(1)}" class="chart-axis-label" text-anchor="end" dominant-baseline="middle">${formatAmt(v, currentLang)}</text>`
    )
    .join("");

  document.getElementById("chartSvgHolder").innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${t.chartTitle}">
      ${yLabels}
      ${zeroLine}
      ${goalLine}
      <polyline class="chart-line" points="${pointsA}" style="stroke:var(--chart-a)" fill="none" stroke-width="2.5"></polyline>
      <polyline class="chart-line" points="${pointsB}" style="stroke:var(--chart-b)" fill="none" stroke-width="2.5"></polyline>
      ${circles}
      ${xLabels}
      ${hitRects}
    </svg>
  `;

  const legendGoalEl = document.getElementById("legendGoal");
  if (legendGoalEl) legendGoalEl.classList.toggle("visible", savingsGoal > 0);

  document.getElementById("chartTableHolder").innerHTML = buildSavingsTableHTML(months, valuesA, valuesB, savingsGoal);

  prepareChartLineAnimation();

  return { months, valuesA, valuesB };
}

// ---------------------------------------------------------------------------
// Chart line-draw animation. The two <polyline>s are given a stroke-dasharray
// equal to their own length and a matching negative offset, which hides them
// completely with no layout impact; animating stroke-dashoffset back to 0
// then "draws" the line. The savings-goal line already carries a permanent
// cosmetic stroke-dasharray, so it's revealed instead via a scaleX transform
// (class `chart-goal-draw`). Runs every time the chart is rebuilt (so it
// redraws visibly whenever salary/bills/commute/currency/etc. change) but
// only once the chart has actually entered the viewport for the first time —
// see `initChartReveal()`, which flips `chartRevealed` (after a short
// "preparing…" delay) and animates the very first draw itself. The very
// first draw is deliberately slower (~2.2s) than every later redraw (~1s),
// tracked via `chartFirstDrawDone`.
// ---------------------------------------------------------------------------
let chartRevealed = false;
let chartFirstDrawDone = false;

function prepareChartLineAnimation() {
  const svg = document.querySelector("#chartSvgHolder svg");
  if (!svg) return;
  const lines = Array.from(svg.querySelectorAll(".chart-line"));
  const goalLine = svg.querySelector(".chart-goal-draw");
  if (!lines.length || typeof lines[0].getTotalLength !== "function") return;

  if (prefersReducedMotion()) {
    // No animation at all — every line stays fully, instantly visible.
    lines.forEach((l) => {
      l.style.transition = "none";
      l.style.strokeDasharray = "";
      l.style.strokeDashoffset = "";
    });
    if (goalLine) {
      goalLine.style.transition = "none";
      goalLine.style.opacity = "1";
      goalLine.style.transform = "none";
    }
    return;
  }

  // Always start hidden (dash length == full line length, offset == full length).
  lines.forEach((l) => {
    const len = l.getTotalLength();
    l.style.transition = "none";
    l.style.strokeDasharray = `${len}`;
    l.style.strokeDashoffset = `${len}`;
  });
  if (goalLine) {
    goalLine.style.transition = "none";
    goalLine.style.transformBox = "fill-box";
    goalLine.style.transformOrigin = "0% 50%";
    goalLine.style.transform = "scaleX(0)";
    goalLine.style.opacity = "0";
  }

  // Only actually draw the lines in if the chart has already been scrolled
  // into view at least once; otherwise leave them hidden until it is
  // (initChartReveal's IntersectionObserver handles that first reveal).
  if (chartRevealed) {
    const duration = chartFirstDrawDone ? "1s" : "2.2s";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        lines.forEach((l) => {
          l.style.transition = `stroke-dashoffset ${duration} cubic-bezier(0.16, 1, 0.3, 1)`;
          l.style.strokeDashoffset = "0";
        });
        if (goalLine) {
          goalLine.style.transition = `transform ${duration} cubic-bezier(0.16, 1, 0.3, 1), opacity ${duration} ease`;
          goalLine.style.transform = "scaleX(1)";
          goalLine.style.opacity = "1";
        }
        chartFirstDrawDone = true;
      });
    });
  }
}

function initChartReveal() {
  const wrap = document.getElementById("chartWrap");
  if (!wrap) return;

  if (prefersReducedMotion() || typeof IntersectionObserver !== "function") {
    chartRevealed = true;
    chartFirstDrawDone = true;
    wrap.classList.remove("chart-pending");
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || wrap.dataset.chartQueued) return;
        wrap.dataset.chartQueued = "1";
        const statusEl = document.getElementById("chartStatus");
        if (statusEl) statusEl.textContent = TRANSLATIONS[currentLang].chartPreparing;
        setTimeout(() => {
          wrap.classList.remove("chart-pending");
          chartRevealed = true;
          prepareChartLineAnimation(); // now draws in, since chartRevealed is true
        }, 850);
        io.unobserve(wrap);
      });
    },
    { threshold: 0.2 }
  );
  io.observe(wrap);
}

function handleChartHover(e) {
  const hit = e.target && e.target.closest ? e.target.closest(".chart-hit") : null;
  if (!hit) return;
  const month = hit.getAttribute("data-month");
  const a = Number(hit.getAttribute("data-a"));
  const b = Number(hit.getAttribute("data-b"));
  const goal = Number(hit.getAttribute("data-goal"));
  const tooltipEl = document.getElementById("chartTooltip");
  tooltipEl.textContent = buildTooltipText(month, a, b, goal);
  tooltipEl.classList.add("visible");
}

function hideChartTooltip() {
  document.getElementById("chartTooltip").classList.remove("visible");
}

function buildPrintSummary(offerData, recommendation) {
  const t = TRANSLATIONS[currentLang];
  const el = document.getElementById("printSummary");
  const monthlyBills = getCanonical("monthlyBills");
  const savingsGoal = getCanonical("savingsGoal");

  const row = (label, a, b) => `<tr><th>${label}</th><td>${a}</td><td>${b}</td></tr>`;
  const timelineText = (offer) => document.getElementById(`timeline${offer}`).innerHTML || "—";

  const rows = [
    row(t.basicSalary, formatMoney(offerData.A.inputs.basicSalary, currentLang), formatMoney(offerData.B.inputs.basicSalary, currentLang)),
    row(t.housingAllowance, formatMoney(offerData.A.inputs.housingAllowance, currentLang), formatMoney(offerData.B.inputs.housingAllowance, currentLang)),
    row(t.transportAllowance, formatMoney(offerData.A.inputs.transportAllowance, currentLang), formatMoney(offerData.B.inputs.transportAllowance, currentLang)),
    row(t.deductionRate, `${formatNumber(offerData.A.inputs.deductionRate)}%`, `${formatNumber(offerData.B.inputs.deductionRate)}%`),
    row(t.printGross, formatMoney(offerData.A.gross, currentLang), formatMoney(offerData.B.gross, currentLang)),
    row(t.printDeduction, formatMoney(offerData.A.deduction, currentLang), formatMoney(offerData.B.deduction, currentLang)),
    row(t.printNet, formatMoney(offerData.A.net, currentLang), formatMoney(offerData.B.net, currentLang)),
    row(t.annualBonus, formatMoney(offerData.A.perks.annualBonus, currentLang), formatMoney(offerData.B.perks.annualBonus, currentLang)),
    row(t.medicalTier, tierLabel(offerData.A.perks.medicalTier, currentLang), tierLabel(offerData.B.perks.medicalTier, currentLang)),
    row(t.leaveDays, formatInt(offerData.A.perks.leaveDays, currentLang), formatInt(offerData.B.perks.leaveDays, currentLang)),
    row(t.annualTakeHome, formatMoney(offerData.A.perks.annual, currentLang), formatMoney(offerData.B.perks.annual, currentLang)),
    row(t.monthlyBills, formatMoney(monthlyBills, currentLang), formatMoney(monthlyBills, currentLang)),
    row(t.commuteCost, formatMoney(offerData.A.commute.commuteCost, currentLang), formatMoney(offerData.B.commute.commuteCost, currentLang)),
    row(t.remoteDays, formatInt(offerData.A.commute.remoteDays, currentLang), formatInt(offerData.B.commute.remoteDays, currentLang)),
    row(t.remainingIncome, formatMoney(offerData.A.remaining, currentLang), formatMoney(offerData.B.remaining, currentLang)),
    row(t.savingsGoal, formatMoney(savingsGoal, currentLang), formatMoney(savingsGoal, currentLang)),
    row(t.printTimeline, timelineText("A"), timelineText("B"))
  ].join("");

  const winnerRow = recommendation.winner
    ? `<p class="print-winner">${t.printWinnerRow}: ${recommendation.winnerLabel}</p>`
    : "";

  const chartTableHTML = document.getElementById("chartTableHolder").innerHTML;

  el.innerHTML = `
    <h1>${t.printTitle}</h1>
    <p class="print-subtitle">${t.printSubtitle}</p>
    <p class="print-meta">${t.printLanguageRow}: ${t.langSelfName} &nbsp;•&nbsp; ${t.printCurrencyRow}: ${currentCurrency}</p>
    <h2>${t.offerA} / ${t.offerB}</h2>
    <table>
      <thead><tr><th></th><th>${t.offerA}</th><th>${t.offerB}</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${winnerRow}
    <h2>${t.printRecommendationHeading}</h2>
    <p class="print-recommendation">${recommendation.text}</p>
    <h2>${t.chartTitle}</h2>
    ${chartTableHTML}
  `;
}

function recalcAll() {
  const offerA = calcOffer("A");
  const offerB = calcOffer("B");
  const netA = offerA.net;
  const netB = offerB.net;

  const perksA = calcPerks("A", netA);
  const perksB = calcPerks("B", netB);

  const commuteA = getCommuteInputs("A");
  const commuteB = getCommuteInputs("B");

  const monthlyBills = getCanonical("monthlyBills");
  const savingsGoal = getCanonical("savingsGoal");

  const { remaining: remainingA, months: monthsA } = calcSavingsColumn("A", netA, monthlyBills, commuteA.commuteCost, savingsGoal);
  const { remaining: remainingB, months: monthsB } = calcSavingsColumn("B", netB, monthlyBills, commuteB.commuteCost, savingsGoal);

  updateComparison(netA, netB, remainingA, remainingB);

  checkCalculationReactions({
    basicSalaryA: offerA.inputs.basicSalary,
    basicSalaryB: offerB.inputs.basicSalary,
    bonusA: perksA.annualBonus,
    bonusB: perksB.annualBonus,
    monthsA, monthsB, savingsGoal
  });

  const recommendation = buildRecommendation({
    netA, netB, remainingA, remainingB, monthsA, monthsB, perksA, perksB, savingsGoal,
    remoteDaysA: commuteA.remoteDays, remoteDaysB: commuteB.remoteDays
  });

  buildSavingsChart({
    netA, netB, monthlyBills, commuteA: commuteA.commuteCost, commuteB: commuteB.commuteCost, savingsGoal
  });

  buildPrintSummary(
    {
      A: { ...offerA, perks: perksA, remaining: remainingA, commute: commuteA },
      B: { ...offerB, perks: perksB, remaining: remainingB, commute: commuteB }
    },
    recommendation
  );
}

function applyCurrency(curr) {
  currentCurrency = curr === "USD" ? "USD" : "SAR";
  document.querySelector(".curr-sar").classList.toggle("active", currentCurrency === "SAR");
  document.querySelector(".curr-usd").classList.toggle("active", currentCurrency === "USD");
  // Re-derive every money input's displayed value from the untouched
  // canonical SAR figure — this is what makes the toggle instantly show
  // converted numbers without any rounding drift on repeated switching.
  refreshMoneyInputsDisplay();
  updateCurrencySuffixes();
}

function applyTheme(theme) {
  currentTheme = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", currentTheme);
  document.querySelector(".theme-dark").classList.toggle("active", currentTheme === "dark");
  document.querySelector(".theme-light").classList.toggle("active", currentTheme === "light");
}

function applyTranslations(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.body.dir = lang === "ar" ? "rtl" : "ltr";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const text = TRANSLATIONS[lang][key];
    if (typeof text === "string") {
      el.textContent = text;
    }
  });

  document.querySelector(".lang-en").classList.toggle("active", lang === "en");
  document.querySelector(".lang-ar").classList.toggle("active", lang === "ar");

  // If the chart is still showing its "preparing…" status (hasn't drawn its
  // first reveal yet), retranslate that message in place too.
  const chartWrap = document.getElementById("chartWrap");
  if (chartWrap && chartWrap.classList.contains("chart-pending")) {
    const statusEl = document.getElementById("chartStatus");
    if (statusEl) statusEl.textContent = TRANSLATIONS[lang].chartPreparing;
  }

  updateCurrencySuffixes();
  updateFixedRateNote();
  recalcAll();
}

// The "1 USD = 3.75 SAR" note has numbers in it too — rebuild it with the
// active locale's own digits (Western in English, Eastern Arabic in Arabic)
// instead of leaving the "1"/"3.75" hardcoded as plain translation text.
function updateFixedRateNote() {
  const t = TRANSLATIONS[currentLang];
  const el = document.querySelector('[data-i18n="fixedRateNote"]');
  if (!el) return;
  el.textContent = `${formatInt(1, currentLang)} ${t.currencyUsdLabel} = ${formatNumber(3.75, currentLang)} ${t.currencyUnit}`;
}

function saveState() {
  const state = {
    lang: currentLang,
    currency: currentCurrency,
    theme: currentTheme,
    A: { ...getOfferInputs("A"), ...getPerkInputs("A"), ...getCommuteInputs("A") },
    B: { ...getOfferInputs("B"), ...getPerkInputs("B"), ...getCommuteInputs("B") },
    monthlyBills: getCanonical("monthlyBills"),
    savingsGoal: getCanonical("savingsGoal")
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  try {
    const state = JSON.parse(raw);
    setOfferInputs("A", state.A || {});
    setOfferInputs("B", state.B || {});
    setPerkInputs("A", state.A || {});
    setPerkInputs("B", state.B || {});
    setCommuteInputs("A", state.A || {});
    setCommuteInputs("B", state.B || {});
    setCanonical("monthlyBills", state.monthlyBills ?? 0);
    setCanonical("savingsGoal", state.savingsGoal ?? 0);
    applyCurrency(state.currency); // also refreshes every money input's display
    applyTheme(state.theme);
    applyTranslations(state.lang === "ar" ? "ar" : "en");
    return true;
  } catch (e) {
    return false;
  }
}

function loadExample() {
  setOfferInputs("A", SAMPLE_OFFERS.offerA);
  setOfferInputs("B", SAMPLE_OFFERS.offerB);
  setPerkInputs("A", SAMPLE_OFFERS.offerA);
  setPerkInputs("B", SAMPLE_OFFERS.offerB);
  setCommuteInputs("A", SAMPLE_OFFERS.offerA);
  setCommuteInputs("B", SAMPLE_OFFERS.offerB);
  setCanonical("monthlyBills", SAMPLE_OFFERS.monthlyBills);
  setCanonical("savingsGoal", SAMPLE_OFFERS.savingsGoal);
  refreshMoneyInputsDisplay(); // sample data is always in SAR; show it in the active currency
  recalcAll();
  saveState();
}

// Fills BOTH offers with clearly-labelled demo figures (not real salary data).
function loadPreset(preset) {
  setOfferInputs("A", preset.offerA);
  setOfferInputs("B", preset.offerB);
  setPerkInputs("A", preset.offerA);
  setPerkInputs("B", preset.offerB);
  setCommuteInputs("A", preset.offerA);
  setCommuteInputs("B", preset.offerB);
  setCanonical("monthlyBills", preset.monthlyBills);
  setCanonical("savingsGoal", preset.savingsGoal);
  refreshMoneyInputsDisplay();
  recalcAll();
  saveState();
}

function clearAll() {
  OFFER_KEYS.forEach((offer) => {
    setOfferInputs(offer, { basicSalary: 0, housingAllowance: 0, transportAllowance: 0, deductionRate: 0 });
    setPerkInputs(offer, { annualBonus: 0, medicalTier: "basic", leaveDays: 0 });
    setCommuteInputs(offer, { commuteCost: 0, remoteDays: 0 });
  });
  setCanonical("monthlyBills", 0);
  setCanonical("savingsGoal", 0);
  refreshMoneyInputsDisplay();
  recalcAll();
  saveState();
}

// ---------------------------------------------------------------------------
// Aquatic mascots — purely decorative (aria-hidden), never intercept clicks.
// Eyes drift smoothly toward the cursor, they blink occasionally, and they
// flash a happy sparkle/smile whenever the user types or clicks a button.
// ---------------------------------------------------------------------------
const MASCOT_IDS = ["mascotHeader", "mascotToolbar", "mascotCompare", "mascotCorner"];
// Populated by initMascots(); referenced elsewhere (e.g. updateComparison's
// "satisfaction" reaction) so it lives at module scope, not just inside
// initMascots()'s own closure.
let mascotEls = [];
const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Six distinct temporary reactions, each mapped to a different kind of user
// action so the mascots feel alive without ever repeating the same beat.
// "awe", "surprise" and "satisfaction" each also show a small elegant glyph
// (✨✨ / O_O / ^__^) above the mascot via .mascot-expression (see updateReactionExpression).
const REACTION_DURATIONS = {
  awe: 750, // load example / preset / print — ✨✨ sparkles
  surprise: 650, // typing a number — O_O wide eyes
  wink: 550, // choosing from a dropdown
  sleepy: 900, // clearing everything — a slow blink-down
  curious: 800, // currency / theme / language toggle — a curious head tilt
  satisfaction: 900 // a new offer takes the lead — ^__^
};
const REACTION_NAMES = Object.keys(REACTION_DURATIONS);
const REACTION_EXPRESSIONS = { awe: "✨✨", surprise: "O_O", satisfaction: "^__^" };

// "High" offer thresholds (always compared in canonical SAR, never in the
// currently displayed/converted currency) that drive the calculation-based
// awe reaction below.
const HIGH_SALARY_SAR = 15000;
const HIGH_BONUS_SAR = 10000;

// Tracks whether the previous recalc already counted as "high"/"fast", so
// these calculation-based reactions fire once on the transition into that
// state rather than re-triggering on every keystroke while it stays true.
let previousHighOffer = false;
let previousGoalFast = false;

function updateMascotGaze(mascot, clientX, clientY) {
  const rect = mascot.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;
  const dist = Math.hypot(dx, dy) || 1;
  const maxOffset = 3; // px — subtle pupil travel, never leaves the eye
  mascot.style.setProperty("--pupil-x", `${((dx / dist) * maxOffset).toFixed(1)}px`);
  mascot.style.setProperty("--pupil-y", `${((dy / dist) * maxOffset).toFixed(1)}px`);
}

function scheduleMascotBlink(mascot) {
  if (prefersReducedMotion()) return;
  const delay = 2500 + Math.random() * 3500;
  setTimeout(() => {
    mascot.classList.add("blinking");
    setTimeout(() => mascot.classList.remove("blinking"), 160);
    scheduleMascotBlink(mascot);
  }, delay);
}

// Swaps in one reaction class (removing any other reaction first) on every
// mascot at once, then removes it again after its own short duration. Pupils
// keep tracking the cursor throughout — reactions only touch eyes/mouth/the
// small expression glyph, never the gaze transform itself.
function triggerReaction(mascots, reaction) {
  const duration = REACTION_DURATIONS[reaction] || 700;
  const glyph = REACTION_EXPRESSIONS[reaction] || "";
  mascots.forEach((m) => {
    REACTION_NAMES.forEach((name) => m.classList.remove(`reaction-${name}`));
    m.classList.add(`reaction-${reaction}`);
    const exprEl = m.querySelector(".mascot-expression");
    if (exprEl) exprEl.textContent = glyph;
    clearTimeout(m._reactionTimer);
    m._reactionTimer = setTimeout(() => {
      m.classList.remove(`reaction-${reaction}`);
      if (exprEl) exprEl.textContent = "";
    }, duration);
  });
}

// Beyond the click/typing/currency-driven reactions above, two reactions are
// purely calculation-based: an offer becomes genuinely impressive (high
// salary or bonus) -> awe; the savings goal becomes reachable quickly or is
// already matched -> satisfaction. Called from recalcAll() on every recalc.
function checkCalculationReactions({ basicSalaryA, basicSalaryB, bonusA, bonusB, monthsA, monthsB, savingsGoal }) {
  const highNow =
    basicSalaryA >= HIGH_SALARY_SAR || basicSalaryB >= HIGH_SALARY_SAR ||
    bonusA >= HIGH_BONUS_SAR || bonusB >= HIGH_BONUS_SAR;
  const highJustStarted = highNow && !previousHighOffer;
  previousHighOffer = highNow;

  const goalFastNow = savingsGoal > 0 && ((monthsA != null && monthsA <= 1) || (monthsB != null && monthsB <= 1));
  const goalJustFast = goalFastNow && !previousGoalFast;
  previousGoalFast = goalFastNow;

  // Only one reaction should win per recalc (they'd otherwise silently
  // clobber each other, e.g. a raise that's both "high" and newly
  // goal-reaching in the same tick). Awe (a rarer, more surprising event)
  // takes priority over satisfaction.
  if (highJustStarted) {
    triggerReaction(mascotEls, "awe");
  } else if (goalJustFast) {
    triggerReaction(mascotEls, "satisfaction");
  }
}

function initMascots() {
  mascotEls = MASCOT_IDS.map((id) => document.getElementById(id)).filter(Boolean);
  if (!mascotEls.length) return;

  // Single shared listener -> every mascot's gaze updates in the same tick,
  // so their eye tracking always stays in sync with each other.
  document.addEventListener("mousemove", (e) => {
    mascotEls.forEach((m) => updateMascotGaze(m, e.clientX, e.clientY));
  });

  mascotEls.forEach((m) => scheduleMascotBlink(m));

  // Capture phase so this fires no matter which input/select/button reacts.
  // Typing a number -> surprise, wide O_O eyes.
  document.addEventListener("input", (e) => {
    if (e.target && e.target.matches && e.target.matches("input")) triggerReaction(mascotEls, "surprise");
  }, true);
  // Picking a dropdown option -> a quick wink.
  document.addEventListener("change", (e) => {
    if (e.target && e.target.matches && e.target.matches("select")) triggerReaction(mascotEls, "wink");
  }, true);
  document.addEventListener("click", (e) => {
    const btn = e.target && e.target.closest ? e.target.closest("button") : null;
    if (!btn) return;
    if (btn.id === "clearAll") {
      triggerReaction(mascotEls, "sleepy"); // clearing everything -> a slow, sleepy blink-down
    } else if (btn.id === "currencyToggle") {
      triggerReaction(mascotEls, "surprise"); // currency changes -> wide O_O eyes
    } else if (btn.id === "themeToggle" || btn.id === "languageToggle") {
      triggerReaction(mascotEls, "curious"); // switching theme/language -> a curious head tilt
    } else {
      triggerReaction(mascotEls, "awe"); // load example / preset / print -> ✨✨ sparkles
    }
  }, true);
}

// ---------------------------------------------------------------------------
// Interactive 3D floating background objects — CSS-only glassmorphic shapes,
// parallaxed via transform updates on scroll/mouse move. Purely decorative,
// aria-hidden, never intercepts clicks (pointer-events:none in CSS), hidden
// in print (.no-print). Disabled entirely when prefers-reduced-motion.
// ---------------------------------------------------------------------------
let parallaxObjs = [];
let parallaxMouseNX = 0;
let parallaxMouseNY = 0;
let parallaxRafPending = false;

function renderParallax() {
  parallaxRafPending = false;
  const scrollY = window.scrollY || window.pageYOffset || 0;
  const mobileFactor = window.innerWidth < 640 ? 0.5 : 1; // gentler motion on small screens
  parallaxObjs.forEach((el) => {
    const depth = Number(el.dataset.depth) || 0.3;
    const speed = Number(el.dataset.speed) || 1;
    const translateY = -(scrollY * depth * speed * 0.35 * mobileFactor);
    const rotateY = parallaxMouseNX * 12 * depth * mobileFactor;
    const rotateX = -parallaxMouseNY * 12 * depth * mobileFactor;
    const rotateZ = scrollY * 0.015 * depth * mobileFactor;
    const scale = 1 + Math.min(0.18, scrollY * 0.00025 * depth);
    el.style.transform =
      `translate3d(0, ${translateY.toFixed(2)}px, 0) rotateX(${rotateX.toFixed(2)}deg) ` +
      `rotateY(${rotateY.toFixed(2)}deg) rotateZ(${rotateZ.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
  });
}

function requestParallaxFrame() {
  if (parallaxRafPending) return;
  parallaxRafPending = true;
  requestAnimationFrame(renderParallax);
}

function initParallaxBackground() {
  parallaxObjs = Array.from(document.querySelectorAll(".float-obj"));
  if (!parallaxObjs.length || prefersReducedMotion()) return; // stays static, no listeners wired at all

  document.addEventListener("mousemove", (e) => {
    parallaxMouseNX = (e.clientX / window.innerWidth) * 2 - 1;
    parallaxMouseNY = (e.clientY / window.innerHeight) * 2 - 1;
    requestParallaxFrame();
  });
  window.addEventListener("scroll", requestParallaxFrame, { passive: true });
  window.addEventListener("resize", requestParallaxFrame);
  requestParallaxFrame();
}

// ---------------------------------------------------------------------------
// Scroll-triggered reveals + a once-only typewriter effect on select titles.
// IntersectionObserver-based; falls back to showing everything immediately
// if unsupported or if the user prefers reduced motion.
// ---------------------------------------------------------------------------

// Types out `el`'s own (already-translated) text one character at a time.
// Reads the full text straight from the DOM, so it works for any language —
// nothing is retranslated or reparsed, just progressively re-displayed.
function runTypewriter(el) {
  el.dataset.typed = "true";
  const full = el.textContent;
  const chars = Array.from(full); // Array.from splits by code point, safe for Arabic
  el.textContent = "";
  el.classList.add("typing");
  let i = 0;
  const step = () => {
    i++;
    el.textContent = chars.slice(0, i).join("");
    if (i < chars.length) {
      setTimeout(step, 28);
    } else {
      el.classList.remove("typing");
    }
  };
  step();
}

function initScrollReveals() {
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  if (!revealEls.length) return;

  const reduced = prefersReducedMotion();
  if (reduced || typeof IntersectionObserver !== "function") {
    // Show everything immediately — no animation, no typewriter replay risk.
    revealEls.forEach((el) => el.classList.add("is-visible"));
    document.querySelectorAll("[data-typewriter]").forEach((el) => { el.dataset.typed = "true"; });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add("is-visible");
        // Stagger any inner cards/options/buttons with a per-item delay
        // (0.25s, 0.5s, 0.75s, ...), capped so a long list doesn't feel sluggish.
        el.querySelectorAll(".reveal-item").forEach((child, i) => {
          child.style.transitionDelay = `${Math.min(i, 6) * 0.25}s`;
        });
        // Only ever type once, and only the first time this section appears.
        const typeTarget = el.querySelector("[data-typewriter]");
        if (typeTarget && typeTarget.dataset.typed !== "true") runTypewriter(typeTarget);
        io.unobserve(el);
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => io.observe(el));
}

// ---------------------------------------------------------------------------
// Ambient glitter background — a handful of tiny twinkling sparkles dropped
// once into the existing `.bg-scene` layer (already fixed, pointer-events:
// none, z-index below the app shell, and hidden in print via `no-print`).
// Purely decorative: skipped entirely under prefers-reduced-motion.
// ---------------------------------------------------------------------------
function initGlitterBackground() {
  if (prefersReducedMotion()) return;
  const scene = document.querySelector(".bg-scene");
  if (!scene) return;

  const colors = ["glitter-aqua", "glitter-ice", "glitter-white", "glitter-gold"];
  const count = 55;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const span = document.createElement("span");
    // Roughly 1 in 6 sparkles is gold, the rest split between the three
    // cooler tones, so gold reads as a rare accent rather than a fourth
    // of every sparkle on screen.
    const colorClass = Math.random() < 0.16 ? "glitter-gold" : colors[Math.floor(Math.random() * 3)];
    span.className = `glitter ${colorClass}`;
    span.style.left = `${(Math.random() * 100).toFixed(2)}%`;
    span.style.top = `${(Math.random() * 100).toFixed(2)}%`;
    const size = 2 + Math.random() * 2.5;
    span.style.width = `${size.toFixed(1)}px`;
    span.style.height = `${size.toFixed(1)}px`;
    span.style.animationDelay = `${(Math.random() * 6).toFixed(2)}s`;
    span.style.animationDuration = `${(4 + Math.random() * 5).toFixed(2)}s`;
    frag.appendChild(span);
  }
  scene.appendChild(frag);
}

// ---------------------------------------------------------------------------
// Rose petal / flower hover-focus decoration. A delegated listener spawns a
// couple of short-lived petal spans near the left/right edges of the
// hovered/focused/tapped element, which float outward and fade on their own
// CSS keyframe, then remove themselves. Throttled per-element via a WeakMap
// timestamp so rapid re-hovers don't spam petals. Skipped entirely under
// prefers-reduced-motion; on touch devices it fires once on tap instead of
// on hover, so nothing ever feels "stuck".
// ---------------------------------------------------------------------------
const PETAL_TARGET_SELECTOR = ".glass-card, .btn, .input-wrap, select";
const petalLastSpawn = new WeakMap();

function spawnPetals(el) {
  const now = Date.now();
  const last = petalLastSpawn.get(el) || 0;
  if (now - last < 700) return;
  petalLastSpawn.set(el, now);

  const rect = el.getBoundingClientRect();
  if (!rect.width && !rect.height) return;

  ["left", "right"].forEach((side) => {
    const petal = document.createElement("span");
    petal.className = `petal petal-${side}`;
    const x = side === "left" ? rect.left : rect.right;
    const y = rect.top + rect.height * (0.3 + Math.random() * 0.4);
    petal.style.left = `${x + window.scrollX}px`;
    petal.style.top = `${y + window.scrollY}px`;
    document.body.appendChild(petal);
    const remove = () => petal.remove();
    petal.addEventListener("animationend", remove, { once: true });
    setTimeout(remove, 1500); // safety net if animationend never fires
  });
}

function initPetalEffects() {
  if (prefersReducedMotion()) return;

  const fineHover = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  document.addEventListener("mouseover", (e) => {
    if (!fineHover()) return;
    const target = e.target.closest ? e.target.closest(PETAL_TARGET_SELECTOR) : null;
    if (!target) return;
    // Emulate mouseenter: ignore moves between a target and its own children.
    if (target.contains(e.relatedTarget)) return;
    spawnPetals(target);
  });

  document.addEventListener("focusin", (e) => {
    const target = e.target.closest ? e.target.closest(PETAL_TARGET_SELECTOR) : null;
    if (target) spawnPetals(target);
  });

  document.addEventListener(
    "pointerdown",
    (e) => {
      if (e.pointerType !== "touch") return;
      const target = e.target.closest ? e.target.closest(PETAL_TARGET_SELECTOR) : null;
      if (target) spawnPetals(target);
    },
    { passive: true }
  );
}

function init() {
  // Wire up mascots first so that any reaction triggered by the initial
  // load (loadState()/loadExample() below, both of which call recalcAll())
  // has real elements to animate instead of an empty mascotEls array.
  initMascots();
  initParallaxBackground();
  initScrollReveals();
  initChartReveal();
  initGlitterBackground();
  initPetalEffects();

  // Fresh visit (no saved data yet): show the built-in example instead of a blank page.
  const hadSavedState = loadState();
  if (!hadSavedState) {
    applyCurrency("SAR");
    applyTheme("dark");
    applyTranslations("en");
    loadExample();
  }

  const numericFieldIds = [
    "monthlyBills",
    "savingsGoal",
    ...OFFER_KEYS.flatMap((offer) => FIELD_IDS.map((field) => `${field}${offer}`)),
    ...OFFER_KEYS.flatMap((offer) => PERK_NUMERIC_IDS.map((field) => `${field}${offer}`)),
    ...OFFER_KEYS.flatMap((offer) => COMMUTE_NUMERIC_IDS.map((field) => `${field}${offer}`))
  ];
  numericFieldIds.forEach((id) => {
    const isMoney = MONEY_INPUT_IDS.includes(id);
    document.getElementById(id).addEventListener("input", (e) => {
      if (isMoney) {
        // Whatever the user just typed is in the *currently displayed*
        // currency — convert it back to SAR before storing it as canonical.
        const raw = Number(e.target.value) || 0;
        setCanonical(id, currentCurrency === "USD" ? raw * USD_RATE : raw);
      }
      recalcAll();
      saveState();
    });
  });

  OFFER_KEYS.forEach((offer) => {
    document.getElementById(`medicalTier${offer}`).addEventListener("change", () => {
      recalcAll();
      saveState();
    });
  });

  document.getElementById("loadExample").addEventListener("click", loadExample);
  document.getElementById("presetGovPrivate").addEventListener("click", () => loadPreset(PRESET_GOV_PRIVATE));
  document.getElementById("presetRemoteOnsite").addEventListener("click", () => loadPreset(PRESET_REMOTE_ONSITE));
  document.getElementById("clearAll").addEventListener("click", clearAll);
  document.getElementById("printComparison").addEventListener("click", () => window.print());

  document.getElementById("languageToggle").addEventListener("click", () => {
    applyTranslations(currentLang === "en" ? "ar" : "en");
    saveState();
  });

  document.getElementById("currencyToggle").addEventListener("click", () => {
    applyCurrency(currentCurrency === "SAR" ? "USD" : "SAR");
    recalcAll();
    saveState();
  });

  document.getElementById("themeToggle").addEventListener("click", () => {
    applyTheme(currentTheme === "dark" ? "light" : "dark");
    saveState();
  });

  const chartWrapEl = document.getElementById("chartWrap");
  chartWrapEl.addEventListener("mousemove", handleChartHover);
  chartWrapEl.addEventListener("focusin", handleChartHover);
  chartWrapEl.addEventListener("mouseleave", hideChartTooltip);
  chartWrapEl.addEventListener("focusout", (e) => {
    if (!chartWrapEl.contains(e.relatedTarget)) hideChartTooltip();
  });
}

document.addEventListener("DOMContentLoaded", init);
