// src/utils/calculatorsManifest.js
// Manifest of calculators used for routing, metadata and the home catalog.
// Keep `component` values identical to your file export names so you can map slug -> import.

const calculators = [
  // --- Popular / Core ---
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
    slug: 'sip-plus-lump',
    title: 'SIP + Lump Sum Calculator',
    description: 'Estimate future value by combining an initial lump sum with monthly SIP contributions and compounding returns.',
    keywords: 'sip plus lump sum, sip calculator, lump sum calculator, investment growth',
    category: 'SIP',
    component: 'SIPWithLumpSum'
  },
  {
    slug: 'compound-interest',
    title: 'Compound Interest Calculator',
    description: 'Maximize your wealth potential. Analyze how different compounding frequencies—monthly, quarterly, or yearly—accelerate your investment growth over time.',
    keywords: 'compound interest calculator, compounding, investment growth, monthly compounding',
    category: 'Math',
    component: 'CompoundInterest'
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
    slug: 'loan-emi',
    title: 'All-in-One Loan Calculator',
    description: 'The ultimate loan tool. Calculate EMI, Maximum Loan Amount, Tenure, or Interest Rate. Features include Amortization Schedule, reverse calculations, and PDF reports.',
    keywords: 'loan calculator, loan emi, loan tenure, interest rate calculator, loan amount',
    category: 'Loan',
    component: 'LoanEMI'
  },
  {
    slug: 'compare-loans',
    title: 'Compare Loans (Flat vs Reducing)',
    description: 'Compare Flat Interest Rate vs Reducing Balance Rate to find the true cost of your loan.',
    keywords: 'loan comparison, flat rate, reducing balance, effective interest rate',
    category: 'Loan',
    component: 'CompareLoans'
  },
  {
    slug: 'advanced-home-loan',
    title: 'Home Loan with Prepayments & Taxes',
    description: 'The most detailed Home Loan planner. Factor in Home Value, Down Payment, Loan Insurance, Property Taxes, and multiple Prepayment strategies.',
    keywords: 'home loan prepayment, mortgage calculator, property tax calculator, loan insurance, home loan planning',
    category: 'Loan',
    component: 'AdvancedHomeLoanEMI'
  },
  {
    slug: 'advanced-home-loan',
    title: 'Home Loan with Prepayments & Taxes',
    description: 'The most detailed Home Loan planner. Factor in Home Value, Down Payment, Loan Insurance, Property Taxes, and multiple Prepayment strategies.',
    keywords: 'home loan prepayment, mortgage calculator, property tax calculator, loan insurance, home loan planning',
    category: 'Loan',
    component: 'AdvancedHomeLoanEMI'
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
    slug: 'ultimate-fire-planner',
    title: 'Ultimate FIRE Planner',
    description: 'The only FIRE tool you need. Covers everything: Time to FIRE, Barista FIRE, Coast FIRE, plus Lean, Standard, Chubby & Fat FIRE analysis.',
    keywords: ['fire', 'financial independence', 'barista fire', 'coast fire', 'lean fire', 'fat fire', 'retirement planner'],
    category: 'Fire',
    component: 'TimeToFIRE'
  },
  {
    slug: 'goal-planner',
    title: 'Goal Planner',
    description: 'Define your dreams—home, education, or wedding. Calculate exactly how much you need to save monthly or as a lump sum to achieve them.',
    keywords: 'goal planner, target amount calculator, future value goal, education planning, retirement goal, house savings, financial freedom',
    category: 'Planner',
    component: 'GoalPlanner'

  },
  {
    slug: 'rent-vs-buy',
    title: 'Rent vs. Buy Calculator',
    description: 'Compare the net worth impact of Renting & Investing vs. Buying a Home over the long term.',
    keywords: 'rent vs buy, home loan vs rent, real estate investment',
    category: 'Decision',
    component: 'RentVsBuy'
  },

  // --- Specialized / Advanced ---
  {
    slug: 'step-up-plus-lump',
    title: 'Step-Up SIP + Lump Sum',
    description: 'Combine a step-up SIP schedule with an initial lump sum to forecast portfolio value over time.',
    keywords: 'step-up sip lump sum, sip escalation, investment planning',
    category: 'SIP',
    component: 'StepUpSIPWithLump'
  },
  {
    slug: 'swp-calculator',
    title: 'SWP Calculator',
    description: 'Model monthly withdrawals from your investment corpus while the remaining balance continues to grow through compounding.',
    keywords: 'swp, systematic withdrawal plan, income, retirement',
    category: 'SIP',
    component: 'SWPCalculator'
  },

  {
    slug: 'swr-simulator',
    title: 'Safe Withdrawal Rate Simulator',
    description: 'Visualize how long your portfolio lasts with different Safe Withdrawal Rates (3%, 4%, 5%).',
    keywords: 'swr, safe withdrawal rate, trinity study, 4% rule',
    category: 'FIRE',
    component: 'SWRSimulator'
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
    slug: 'topup-loan-emi',
    title: 'Top-Up Loan EMI Calculator',
    description: 'Estimate EMI impact and revised amortization when a top-up is taken on an existing loan.',
    keywords: 'top-up loan emi, loan topup calculator, additional loan EMI',
    category: 'Loan',
    component: 'TopUpLoanEMI'
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
    slug: 'home-loan-eligibility',
    title: 'Home Loan Eligibility',
    description: 'Calculate the maximum home loan amount you can borrow based on your salary, existing EMIs, and bank criteria.',
    keywords: 'home loan eligibility, loan capacity, how much loan can i get, mortgage eligibility',
    category: 'Loan',
    component: 'HomeLoanEligibility'
  },
  {
    slug: 'property-loan-eligibility',
    title: 'Property-Centric Loan Eligibility',
    description: 'A professional RM tool to calculate loan eligibility based on property value, LTV limits, and joint incomes.',
    keywords: 'loan eligibility, rm tool, ltv calculator, home loan funding, property loan',
    category: 'Loan',
    component: 'PropertyLoanEligibility'
  }
];

export default calculators;
