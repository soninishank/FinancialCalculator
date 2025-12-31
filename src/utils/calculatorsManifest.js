// src/utils/calculatorsManifest.js
// Manifest of calculators used for routing, metadata and the home catalog.
// Keep `component` values identical to your file export names so you can map slug -> import.

const calculators = [
  // --- Popular / Core ---
  {
    slug: 'pure-sip',
    title: 'SIP Calculator',
    description: 'Calculate the future value of your monthly SIP investments accurately. Use our SIP calculator to estimate returns from mutual funds and build your wealth.',
    keywords: 'sip calculator, monthly sip, mutual fund sip, investment calculator, sip calculator sbi, sip calculator groww, sip calculator yearly, daily sip calculator, sip calculator hdfc, monthly sip calculator, sip, sip calculator icici, sip calculator axis bank, sip calculator kotak, sip calculator bandhan bank, sip calculator au finance',
    category: 'SIP + LUMPSUM',
    component: 'PureSIP'
  },
  {
    slug: 'time-to-goal',
    title: 'Time to Goal Calculator',
    description: 'Calculate exactly how long it will take to reach your financial goal. Determine the years required to grow your lump sum investment to your target amount.',
    keywords: 'time to goal calculator, investment duration, how long to double money, goal tenure, target date calculator',
    category: 'Planner',
    component: 'TimeDurationCalculator'
  },
  {
    slug: 'lump-sum',
    title: 'Lump Sum Calculator',
    description: 'Estimate the future value of your one-time mutual fund investment. See how a lump-sum investment grows over time with the power of compounding.',
    keywords: 'lump sum calculator, one-time investment, compound interest',
    category: 'SIP + LUMPSUM',
    component: 'LumpSumOnly'
  },
  {
    slug: 'sip-plus-lump',
    title: 'SIP + Lump Sum Calculator',
    description: 'Combine initial lump sum and monthly SIP to forecast your total portfolio value. Plan your wealth creation strategy with this powerful hybrid tool.',
    keywords: 'sip plus lump sum, sip calculator, lump sum calculator, investment growth',
    category: 'SIP + LUMPSUM',
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
    description: 'Accelerate wealth creation with a Step-Up SIP. Calculate how increasing your monthly investment annually—matching your salary hikes—can exponentially boost your final maturity corpus.',
    keywords: 'step-up sip, increasing sip, sip escalator, sip growth, step up sip calculator',
    category: 'SIP + LUMPSUM',
    component: 'StepUpSIP'
  },
  {
    slug: 'loan-emi',
    title: 'All-in-One Loan Calculator',
    description: 'The ultimate loan tool. Calculate EMI, Maximum Loan Amount, Tenure, or Interest Rate. Features include Amortization Schedule, reverse calculations, and PDF reports.',
    keywords: 'loan calculator, loan emi, loan tenure, interest rate calculator, loan amount, emi calculator, personal loan emi calculator sbi, personal loan emi calculator google, personal loan emi calculator icici, personal loan emi calculator app, personal loan emi calculator axis bank, personal loan emi calculator in months, personal loan emi calculator hdfc, personal loan emi calculator for 6 months, home loan emi calculator, car loan emi calculator, loan emi calculator app, business loan emi calculator, consumer loan emi calculator, sbi personal loan emi calculator, education loan emi calculator, bandhan bank personal loan emi calculator, au finance personal loan emi calculator, kotak personal loan emi calculator, indusind loan emi calculator, idfc first bank loan calculator, personal loan emi calculator yes bank, personal loan emi calculator pnb, personal loan emi calculator bank of baroda',
    category: 'Loan',
    component: 'LoanEMI'
  },
  {
    slug: 'car-loan-emi',
    title: 'Car Loan EMI Calculator',
    description: 'Calculate monthly EMIs for your dream car. Compare interest rates and find the most affordable loan tenure for your new or used vehicle purchase.',
    keywords: 'car loan emi calculator, auto loan calculator, car emi, vehicle loan calculator, new car loan emi, used car loan sbi, car loan emi calculator groww, car loan emi calculator hdfc, car loan emi calculator icici, car loan interest rate',
    category: 'Loan',
    component: 'CarLoanEMI'
  },
  {
    slug: 'advanced-car-loan-emi',
    title: 'Advanced Car Loan EMI',
    description: 'Plan your dream car with detailed fee analysis, depreciation tracking, and affordability checks.',
    keywords: 'advanced car loan calculator, car depreciation calculator, vehicle cost of ownership, car loan with fees, auto loan analysis',
    category: 'Loan',
    component: 'AdvancedCarLoanEMI'
  },
  {
    slug: 'step-up-loan-emi',
    title: 'Loan Step-Up & Prepayment Analysis',
    description: 'Visualize the impact of increasing your EMI annually (Step-Up) or getting a lower interest rate.',
    keywords: 'step up loan, increasing emi, loan prepayment calculator, interest rate drop calculator',
    category: 'Loan',
    component: 'StepUpLoanEMI'
  },
  {
    slug: 'moratorium-loan-emi',
    title: 'Moratorium Calculator',
    description: 'Calculate the financial impact of opting for a loan moratorium (EMI Holiday). See how interest capitalization affects your future EMI.',
    keywords: 'moratorium calculator, loan holiday, skip emi, interest capitalization',
    category: 'Loan',
    component: 'MoratoriumLoanEMI'
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
    keywords: 'home loan prepayment, mortgage calculator, property tax calculator, loan insurance, home loan planning, home loan emi calculator, mortgage calculator chase, mortgage calculator bank of america, mortgage calculator wells fargo, mortgage calculator citibank, mortgage calculator us bank, mortgage calculator pnc, sbi home loan emi calculator, hdfc home loan calculator, icici home loan emi calculator, axis bank home loan calculator',
    category: 'Loan',
    component: 'AdvancedHomeLoanEMI'
  },

  {
    slug: 'cagr-calculator',
    title: 'CAGR Calculator',
    description: 'Compare investment performance with our CAGR calculator. Determine the Compound Annual Growth Rate for stocks, mutual funds, or any asset over multiple years with annualised precision.',
    keywords: 'cagr calculator, compound annual growth rate, investment returns, cagr formula',
    category: 'Math',
    component: 'CAGRCalculator'
  },
  {
    slug: 'ultimate-fire-planner',
    title: 'Ultimate FIRE Planner',
    description: 'The only FIRE tool you need. Covers everything: Time to FIRE, Barista FIRE, Coast FIRE, plus Lean, Standard, Chubby & Fat FIRE analysis.',
    keywords: ['fire', 'financial independence', 'barista fire', 'coast fire', 'lean fire', 'fat fire', 'retirement planner'],
    category: 'FIRE',
    component: 'TimeToFIRE'
  },
  {
    slug: 'target-amount-calculator',
    title: 'Target Amount Calculator',
    description: 'Planning for a specific financial goal? Calculate exactly how much you need to save monthly (SIP) or as a one-time lump sum to reach your target amount by a specific date.',
    keywords: 'target amount calculator, goal planner, sip for goal, investment for target, financial goal calculator, education planning, retirement goal',
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
    title: 'SIP + Lump Sum + Step Up',
    description: 'Combine a step-up SIP schedule with an initial lump sum to forecast portfolio value over time.',
    keywords: 'step-up sip lump sum, sip escalation, investment planning',
    category: 'SIP + LUMPSUM',
    component: 'StepUpSIPWithLump'
  },
  {
    slug: 'swp-calculator',
    title: 'SWP Calculator',
    description: 'Generate a steady monthly income with our SWP calculator. Plan systematic withdrawals from your mutual fund corpus while ensuring your remaining capital continues to grow tax-efficiently.',
    keywords: 'swp, systematic withdrawal plan, income, retirement, swp calculator, swp calculator sbi, swp calculator hdfc, swp calculator icici, swp calculator axis bank, swp calculator kotak, swp calculator bandhan bank, swp calculator au finance',
    category: 'SIP + LUMPSUM',
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
    description: 'Plan your short-term goals with our Recurring Deposit (RD) calculator. Estimate guaranteed maturity values with quarterly compounding for bank and post office RD schemes.',
    keywords: 'recurring deposit, rd calculator, post office rd, bank rd, rd interest rate',
    category: 'Bank Scheme',
    component: 'RecurringDeposit'
  },
  {
    slug: 'fixed-deposit',
    title: 'Fixed Deposit (FD) Calculator',
    description: 'Maximize your savings with our Fixed Deposit (FD) calculator. Estimate maturity amounts for cumulative FDs or calculate monthly/quarterly payouts for regular income. Support for all major banks.',
    keywords: 'fd calculator, fixed deposit, term deposit, bank fd, interest payout, fd calculator sbi, fd calculator hdfc, fd calculator chase, fd calculator wells fargo, fd calculator icici, fd calculator axis bank, fd calculator bandhan bank, fd calculator au finance, fd calculator kotak mahindra, fd calculator citibank, fd calculator capital one, fd calculator pnc bank',
    category: 'Bank Scheme',
    component: 'FixedDeposit'
  },
  {
    slug: 'ppf-calculator',
    title: 'PPF Calculator',
    description: 'Plan your retirement with the Public Provident Fund (PPF) calculator. Estimate tax-free returns and maturity value for India’s safest government-backed EEE investment scheme.',
    keywords: 'ppf calculator, public provident fund, tax saving, 80c, retirement, ppf interest rate, ppf extension',
    category: 'Bank Scheme',
    component: 'PPFCalculator'
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
    slug: 'emi-comparison',
    title: 'EMI Comparison Calculator',
    description: 'Compare multiple loan offers side-by-side. Analyze EMI differences, total interest payable, and repayment schedules to choose the best loan.',
    keywords: 'emi comparison, compare loans, loan comparison, multiple loans, loan offers',
    category: 'Loan',
    component: 'EMIComparison'
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
  },
  {
    slug: 'expense-ratio-calculator',
    title: 'Expense Ratio Calculator',
    description: 'See how much your mutual fund expense ratio is costing you over time. Analyze the impact of fees on your long-term wealth.',
    keywords: 'expense ratio, mutual fund cost, investment fees, ter calculator, wealth comparison, direct vs regular, fund management charges, impact of fees, long term wealth',
    category: 'SIP + LUMPSUM',
    component: 'ExpenseRatioCalculator'
  },
  {
    slug: 'xirr-calculator',
    title: 'XIRR Calculator',
    description: 'Calculate the Extended Internal Rate of Return (XIRR) for irregular investments and withdrawals.',
    keywords: 'xirr calculator, sip returns, irregular cash flows, portfolio return, extended internal rate of return',
    category: 'General',
    component: 'XIRRCalculator'
  }
];

export default calculators;
