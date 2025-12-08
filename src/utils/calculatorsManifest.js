// src/utils/calculatorsManifest.js
// Manifest of calculators used for routing, metadata and the home catalog.
// Keep `component` values identical to your file export names so you can map slug -> import.

const calculators = [
  {
    slug: 'sip-plus-lump',
    title: 'SIP + Lump Sum Calculator',
    description: 'Estimate future value by combining an initial lump sum with monthly SIP contributions and compounding returns.',
    keywords: 'sip plus lump sum, sip calculator, lump sum calculator, investment growth',
    category: 'SIP',
    component: 'SIPWithLumpSum'
  },
  {
    slug: 'pure-sip',
    title: 'SIP Calculator',
    description: 'Calculate the future value of regular monthly SIP investments at an expected annual return rate.',
    keywords: 'sip calculator, monthly sip, mutual fund sip, investment calculator',
    category: 'SIP',
    component: 'PureSIP'
  },
  {
    slug: 'lump-sum',
    title: 'Lump Sum Calculator',
    description: 'Project growth of a single lump-sum investment over time using compound interest.',
    keywords: 'lump sum calculator, one-time investment, compound interest',
    category: 'Lump Sum',
    component: 'LumpSumOnly'
  },
  {
    slug: 'step-up-sip',
    title: 'Step-Up SIP Calculator',
    description: 'Model SIPs that increase periodically (step-up) to reflect salary hikes or increasing savings capacity.',
    keywords: 'step-up sip, increasing sip, sip escalator, sip growth',
    category: 'SIP',
    component: 'StepUpSIP'
  },
  {
    slug: 'step-up-plus-lump',
    title: 'Step-Up SIP + Lump Sum',
    description: 'Combine a step-up SIP schedule with an initial lump sum to forecast portfolio value over time.',
    keywords: 'step-up sip lump sum, sip escalation, investment planning',
    category: 'SIP',
    component: 'StepUpSIPWithLump'
  },
  {
    slug: 'goal-planner',
    title: 'Goal Planner',
    description: 'Plan financial goals (education, retirement, house) by estimating required monthly savings or lump sum to reach targets.',
    keywords: 'goal planner, financial goals, savings plan, target planning',
    category: 'Planner',
    component: 'GoalPlanner'
  },
  {
    slug: 'loan-emi',
    title: 'Loan EMI Calculator',
    description: 'Compute EMI, total interest and amortization schedule for loans given principal, rate and tenure.',
    keywords: 'loan emi calculator, emi schedule, amortization, loan interest',
    category: 'Loan',
    component: 'LoanEMI'
  },
  {
    slug: 'cagr-calculator',
    title: 'CAGR Calculator',
    description: 'Calculate the Compound Annual Growth Rate (CAGR) between two values across a period.',
    keywords: 'cagr calculator, compound annual growth rate, investment returns',
    category: 'Math',
    component: 'CAGRCalculator'
  },
  {
    slug: 'topup-loan-emi',
    title: 'Top-Up Loan EMI Calculator',
    description: 'Estimate EMI impact and revised amortization when a top-up is taken on an existing loan.',
    keywords: 'top-up loan emi, loan topup calculator, additional loan EMI',
    category: 'Loan',
    component: 'TopUpLoanEMI'
  },
  {
    slug: 'swp-calculator',
    title: 'SWP Calculator',
    description: 'Model monthly withdrawals from your investment corpus while the remaining balance continues to grow through compounding.',
    keywords: 'swp, systematic withdrawal plan, income, retirement',
    category: 'SIP',
    component: 'SWPCalculator'
  },
];

export default calculators;
