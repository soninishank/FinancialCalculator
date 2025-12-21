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
  // --- FIRE Specific ---
  {
    slug: 'time-to-fire',
    title: 'Time to FIRE',
    description: 'Calculate exactly when you can reach Financial Independence based on your current savings and expenses.',
    keywords: 'fire, financial independence, retire early, retirement calculator',
    category: 'FIRE',
    component: 'TimeToFIRE'
  },
  {
    slug: 'coast-fire',
    title: 'Coast FIRE Calculator',
    description: 'Find out if you have saved enough already to coast to retirement without further contributions.',
    keywords: 'coast fire, retirement planning, compound interest, f-you money',
    category: 'FIRE',
    component: 'CoastFIRE'
  },
  {
    slug: 'swr-simulator',
    title: 'Safe Withdrawal Rate Simulator',
    description: 'Visualize how long your portfolio lasts with different Safe Withdrawal Rates (3%, 4%, 5%).',
    keywords: 'swr, safe withdrawal rate, trinity study, 4% rule',
    category: 'FIRE',
    component: 'SWRSimulator'
  },
  // --- Decision Making ---
  {
    slug: 'rent-vs-buy',
    title: 'Rent vs. Buy Calculator',
    description: 'Compare the net worth impact of Renting & Investing vs. Buying a Home over the long term.',
    keywords: 'rent vs buy, home loan vs rent, real estate investment',
    category: 'Decision',
    component: 'RentVsBuy'
  },
  {
    slug: 'cost-of-delay',
    title: 'Cost of Delay Calculator',
    description: 'See the massive financial penalty of delaying your investments by even a few years.',
    keywords: 'cost of delay, power of compounding, investment penalty',
    category: 'Decision',
    component: 'CostOfDelay'
  },
  {
    slug: 'step-down-withdrawal',
    title: 'Step-Down Withdrawal',
    description: 'Plan retirement with variable expense phases (e.g., active early retirement vs. passive later years).',
    keywords: 'step down swp, variable withdrawal, retirement bucket',
    category: 'Decision',
    component: 'StepDownWithdrawal'
  },
  // --- Wealth / Hygiene ---
  {
    slug: 'inflation-impact',
    title: 'Inflation Impact',
    description: 'Visualize how inflation erodes the purchasing power of your money over time.',
    keywords: 'inflation calculator, purchasing power, real value',
    category: 'Wealth',
    component: 'InflationImpact'
  },
  {
    slug: 'asset-allocation',
    title: 'Asset Allocation Rebalancer',
    description: 'Check if your portfolio has drifted and get Buy/Sell instructions to rebalance Equity and Debt.',
    keywords: 'asset allocation, portfolio rebalance, equity debt split',
    category: 'Wealth',
    component: 'AssetAllocation'
  },
  {
    slug: 'simple-interest',
    title: 'Simple Interest Calculator',
    description: 'Calculate interest earned on a principal amount over time without compounding.',
    keywords: 'simple interest, interest calculator, flat rate',
    category: 'Math',
    component: 'SimpleInterest'
  },
  {
    slug: 'recurring-deposit',
    title: 'Recurring Deposit Calculator',
    description: 'Calculate maturity value of monthly recurring deposits with quarterly compounding.',
    keywords: 'recurring deposit, rd calculator, post office rd, bank rd',
    category: 'Bank Scheme',
    component: 'RecurringDeposit'
  },
  {
    slug: 'credit-card-payoff',
    title: 'Credit Card Payoff',
    description: 'Find out how long it will take to become debt-free and how much interest you can save by increasing payments.',
    keywords: 'credit card, debt payoff, credit card calculator, debt free',
    category: 'Debt',
    component: 'CreditCardPayoff'
  },
  {
    slug: 'roi-calculator',
    title: 'ROI Calculator',
    description: 'Calculate your Return on Investment in percentage and annualized terms to evaluate profitability.',
    keywords: 'roi, return on investment, investment return, profit calculator',
    category: 'General',
    component: 'ROICalculator'
  },
  {
    slug: 'rule-of-72',
    title: 'Rule of 72',
    description: 'Estimate how many years it will take to double your money at a fixed interest rate.',
    keywords: 'rule of 72, doubling time, compound interest, investment growth',
    category: 'Math',
    component: 'RuleOf72'
  },
  {
    slug: 'refinance-calculator',
    title: 'Refinance Calculator',
    description: 'Calculate monthly savings and break-even point when refinancing a loan.',
    keywords: 'refinance, mortgage refinance, loan switch, savings, break even',
    category: 'Loan',
    component: 'RefinanceCalculator'
  },
  {
    slug: 'compound-interest',
    title: 'Compound Interest Calculator',
    description: 'Calculate the growth of your investments with compounding at different frequencies (monthly, quarterly, yearly).',
    keywords: 'compound interest calculator, compounding, investment growth, monthly compounding',
    category: 'Math',
    component: 'CompoundInterest'
  }
];

export default calculators;
