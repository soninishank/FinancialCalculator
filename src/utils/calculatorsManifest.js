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
    description: 'Planning for a specific financial goal? Calculate exactly how much you need to save monthly (SIP), as a Step-Up SIP, or as a one-time lump sum to reach your target amount by a specific date.',
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
  },
  {
    slug: 'gst-calculator',
    title: 'GST Calculator',
    description: 'Calculate GST inclusive and exclusive amounts. Toggle between 5%, 12%, 18%, and 28% tax slabs for accurate billing.',
    keywords: 'gst calculator, gst calculation, gst india, gst inclusive, gst exclusive, gst rate, gst amount',
    category: 'Tax',
    component: 'GSTCalculator'
  },
  {
    slug: 'nps-calculator',
    title: 'NPS Calculator',
    description: 'Estimate your pension and lump sum amount upon retirement. Plan your National Pension System contributions effectively.',
    keywords: 'nps calculator, national pension system, pension calculator, retirement planning, nps tier 1, nps return',
    category: 'Govt Scheme',
    component: 'NPSCalculator'
  },
  {
    slug: 'ssy-calculator',
    title: 'Sukanya Samriddhi Yojana (SSY)',
    description: 'Calculate maturity amount for your daughter’s future. Plan investments for the Sukanya Samriddhi Yojana scheme with current interest rates.',
    keywords: 'ssy calculator, sukanya samriddhi yojana, girl child scheme, ssy interest rate, ssy maturity, tax saving scheme',
    category: 'Govt Scheme',
    component: 'SSYCalculator'
  },
  {
    slug: '401k-calculator',
    title: '401(k) Retirement Calculator',
    description: 'Estimate your 401(k) balance at retirement including employer matching contributions and annual growth.',
    keywords: '401k calculator, retirement planner, employer match, 401k contribution, us retirement',
    category: 'Retirement (US)',
    component: 'Calculator401k'
  },
  {
    slug: 'roth-ira-calculator',
    title: 'Roth IRA Calculator',
    description: 'Calculate tax-free growth potential in a Roth IRA. Plan annual contributions and visualize long-term savings.',
    keywords: 'roth ira calculator, tax free retirement, ira contribution limit, roth growth, retirement savings',
    category: 'Retirement (US)',
    component: 'RothIRACalculator'
  },
  {
    slug: '529-college-savings',
    title: '529 College Savings Plan',
    description: 'Plan for your child\'s education costs. Calculate savings growth and estimated shortfall for college expenses.',
    keywords: '529 calculator, college savings, education planning, college cost estimator, 529 plan',
    category: 'Education',
    component: 'CollegeSavings529'
  },
  {
    slug: 'us-mortgage-calculator',
    title: 'US Mortgage Calculator',
    description: 'Calculate your monthly US mortgage payments including Property Tax, PMI, Home Insurance, and HOA fees.',
    keywords: 'us mortgage calculator, pmi calculator, property tax, us home loan',
    category: 'Loan',
    component: 'USMortgageCalculator'
  },
  {
    slug: 'rmd-calculator',
    title: 'RMD Calculator',
    description: 'Required Minimum Distribution (RMD) calculator for US retirement accounts. Plan your mandatory withdrawals starting at age 73.',
    keywords: 'rmd calculator, required minimum distribution, ira withdrawal, 401k rmd, us retirement',
    category: 'Retirement (US)',
    component: 'RMDCalculator'
  },
  {
    slug: 'us-capital-gains',
    title: 'US Capital Gains Tax',
    description: 'Estimate your Federal Capital Gains Tax. Compare Short Term vs. Long Term tax liability based on your income bracket.',
    keywords: 'capital gains tax, us tax calculator, short term capital gains, long term capital gains, investment tax',
    category: 'Tax',
    component: 'USCapitalGainsCalculator'
  },
  {
    slug: 'social-security-break-even',
    title: 'Social Security Break-Even',
    description: 'Optimize your Social Security claiming strategy. Compare monthly benefits and lifetime payouts for claiming at 62, Full Retirement Age, or 70.',
    keywords: 'social security calculator, claiming age, retirement benefits, ssa break even, early vs late filing',
    category: 'Retirement (US)',
    component: 'SocialSecurityCalculator'
  },
  {
    slug: 'us-paycheck-calculator',
    title: 'US Paycheck Calculator',
    description: 'Calculate your take-home pay check. Estimate Federal, FICA, and State taxes 2024.',
    keywords: 'paycheck calculator, salary calculator, take home pay, after tax income, federal tax calculator',
    category: 'Tax',
    component: 'USPaycheckCalculator'
  },
  {
    slug: 'hsa-calculator',
    title: 'HSA Growth Calculator',
    description: 'Estimate the future value of your Health Savings Account. Account for contributions, growth, and medical expenses.',
    keywords: 'hsa calculator, health savings account, hsa growth, triple tax advantage, medical savings',
    category: 'Retirement (US)',
    component: 'HSACalculator'
  },
  {
    slug: 'hourly-to-salary',
    title: 'Hourly to Salary Converter',
    description: 'Convert your hourly wage to its annual, monthly, or weekly equivalent salary. Simple and precise.',
    keywords: 'hourly to salary, wage converter, hourly pay, annual salary calculator, wage estimation',
    category: 'Utility',
    component: 'HourlyToSalaryCalculator'
  },
  // --- USA-Specific Calculators (Student Loans, Healthcare, Tax, Real Estate, Debt) ---
  {
    slug: 'student-loan-payoff',
    title: 'Student Loan Payoff Calculator',
    description: 'Calculate student loan payoff strategies with standard and extended repayment plans. See how extra payments reduce total interest and accelerate debt freedom.',
    keywords: 'student loan calculator, student debt payoff, loan forgiveness, income driven repayment, student loan interest, student loan repayment, extra payment impact',
    category: 'Loan',
    component: 'StudentLoanPayoffCalculator'
  },
  {
    slug: 'student-loan-forgiveness',
    title: 'Student Loan Forgiveness Calculator',
    description: 'Estimate Public Service Loan Forgiveness (PSLF) and Income-Driven Repayment (IDR) forgiveness timelines. Track qualifying payments and plan for tax implications.',
    keywords: 'pslf calculator, loan forgiveness, public service loan forgiveness, idr forgiveness, student loan forgiveness, income driven repayment, qualifying payments',
    category: 'Loan',
    component: 'StudentLoanForgivenessCalculator'
  },
  {
    slug: 'medicare-cost-estimator',
    title: 'Medicare Cost Estimator',
    description: 'Calculate Medicare Part B, Part D, Medigap premiums, and IRMAA surcharges based on income. Project lifetime healthcare costs in retirement.',
    keywords: 'medicare cost calculator, medicare premium, irmaa calculator, medigap cost, medicare part b cost, part d premium, retirement healthcare',
    category: 'Retirement (US)',
    component: 'MedicareCostEstimator'
  },
  {
    slug: 'aca-marketplace-calculator',
    title: 'ACA Marketplace Calculator',
    description: 'Estimate health insurance premiums and Premium Tax Credits (subsidies) on the ACA Marketplace. Compare Bronze, Silver, Gold, and Platinum plans.',
    keywords: 'aca subsidy calculator, healthcare marketplace, obamacare premium, premium tax credit, health insurance subsidy, affordable care act, marketplace calculator',
    category: 'Tax',
    component: 'ACAMarketplaceCalculator'
  },
  {
    slug: 'child-tax-credit',
    title: 'Child Tax Credit Calculator',
    description: 'Calculate Child Tax Credit (CTC) and Additional Child Tax Credit (refundable portion). Understand phase-out thresholds and dependent care credits.',
    keywords: 'child tax credit calculator, ctc calculator, dependent tax credit, family tax benefits, irs child credit, additional child tax credit, tax credits',
    category: 'Tax',
    component: 'ChildTaxCreditCalculator'
  },
  {
    slug: 'fsa-calculator',
    title: 'FSA Calculator',
    description: 'Optimize Flexible Spending Account contributions. Calculate tax savings from Healthcare FSA and Dependent Care FSA with use-it-or-lose-it planning.',
    keywords: 'fsa calculator, flexible spending account, fsa tax savings, dependent care fsa, health fsa limit, fsa contribution, healthcare fsa',
    category: 'Tax',
    component: 'FSACalculator'
  },
  {
    slug: 'traditional-ira-calculator',
    title: 'Traditional IRA Calculator',
    description: 'Calculate Traditional IRA growth, tax deductions, and Required Minimum Distributions (RMD). Understand contribution limits and phase-out rules.',
    keywords: 'traditional ira calculator, ira contribution limit, ira tax deduction, ira growth calculator, retirement savings, rmd calculator, ira phase out',
    category: 'Retirement (US)',
    component: 'TraditionalIRACalculator'
  },
  {
    slug: 'home-affordability-calculator',
    title: 'Home Affordability Calculator',
    description: 'Calculate maximum affordable home price using the 28/36 rule. Analyze debt-to-income ratios, PMI costs, and detailed payment breakdown.',
    keywords: 'home affordability calculator, how much house can i afford, dti calculator, mortgage affordability, home buying budget, debt to income ratio, pmi calculator',
    category: 'Loan',
    component: 'HomeAffordabilityCalculator'
  },
  {
    slug: 'auto-lease-vs-buy',
    title: 'Auto Lease vs Buy Calculator',
    description: 'Compare total cost of leasing versus buying a vehicle. Analyze money factor, residual value, depreciation, and long-term ownership costs.',
    keywords: 'lease vs buy calculator, car lease calculator, auto lease comparison, vehicle lease or buy, car buying decision, money factor, residual value',
    category: 'Decision',
    component: 'AutoLeaseVsBuyCalculator'
  },
  {
    slug: 'property-tax-estimator',
    title: 'Property Tax Estimator',
    description: 'Estimate annual property taxes by state and county. Understand SALT deduction limits, homestead exemptions, and long-term tax projections.',
    keywords: 'property tax calculator, real estate tax estimator, property tax by state, home tax calculator, annual property tax, salt deduction, homestead exemption',
    category: 'Tax',
    component: 'PropertyTaxEstimator'
  },
  {
    slug: 'debt-avalanche-snowball',
    title: 'Debt Avalanche vs Snowball Calculator',
    description: 'Compare Avalanche (highest interest) and Snowball (smallest balance) debt payoff methods. Track multiple debts and visualize payoff timelines.',
    keywords: 'debt payoff calculator, avalanche vs snowball, debt reduction strategy, debt consolidation, multiple debt payoff, debt free calculator, payoff comparison',
    category: 'Loan',
    component: 'DebtAvalancheSnowballCalculator'
  },
  {
    slug: 'fico-score-impact',
    title: 'FICO Score Impact Calculator',
    description: 'Simulate how financial actions affect your credit score. Test scenarios for paying down debt, opening new credit, and improving payment history.',
    keywords: 'fico score calculator, credit score simulator, credit utilization calculator, improve credit score, credit score impact, credit score estimator, credit factors',
    category: 'Utility',
    component: 'FICOScoreImpactCalculator'
  },
  // --- Regional / Tax (New) ---
  {
    slug: 'uk-income-tax',
    title: 'UK Income Tax Calculator',
    description: 'Calculate your UK take-home pay after Income Tax, National Insurance, and Pension contributions for the 2024/25 tax year.',
    keywords: 'uk tax calculator, take home pay uk, salary calculator uk, national insurance, income tax england',
    category: 'Regional',
    component: 'UKIncomeTaxCalculator'
  },
  {
    slug: 'australia-income-tax',
    title: 'Australia Income Tax Calculator',
    description: 'Estimate your Australian net pay after Stage 3 tax cuts, Medicare Levy, and Superannuation contributions.',
    keywords: 'australia tax calculator, pay calculator au, stage 3 tax cuts, medicare levy, superannuation',
    category: 'Regional',
    component: 'AustraliaIncomeTaxCalculator'
  },
  {
    slug: 'canada-income-tax',
    title: 'Canada Income Tax Calculator',
    description: 'Calculate your Canadian take-home pay including Federal, Provincial taxes, CPP, and EI deductions.',
    keywords: 'canada tax calculator, salary calculator canada, federal tax brackets, ontario tax, rrsp tax savings',
    category: 'Regional',
    component: 'CanadaIncomeTaxCalculator'
  },
  {
    slug: 'europe-vat',
    title: 'Europe VAT Calculator',
    description: 'Quickly calculate VAT inclusive and exclusive amounts for European countries like Germany, France, and Spain.',
    keywords: 'vat calculator, europe vat, vat inclusive, value added tax, germany vat, france vat',
    category: 'Regional',
    component: 'EuropeVATCalculator'
  },
  {
    slug: 'japan-paycheck',
    title: 'Japan Paycheck Calculator',
    description: 'Estimate your net salary in Japan after Social Insurance, National Income Tax, and Resident Tax.',
    keywords: 'japan tax calculator, salary japan, japan take home pay, social insurance japan, resident tax',
    category: 'Regional',
    component: 'JapanPaycheckCalculator'
  },
  {
    slug: 'hongkong-salary-tax',
    title: 'Hong Kong Salary Tax Calculator',
    description: 'Calculate your Hong Kong take-home pay after MPF contributions and Salaries Tax using progressive or standard rates.',
    keywords: 'hong kong tax calculator, hk salary tax, mpf calculator, hk tax allowance, salaries tax hk',
    category: 'Regional',
    component: 'HongKongSalaryTaxCalculator'
  },
  {
    slug: 'china-income-tax',
    title: 'China Income Tax Calculator',
    description: 'Estimate your Individual Income Tax (IIT) and take-home pay in China after social insurance deductions.',
    keywords: 'china tax calculator, iit china, china salary calculator, social insurance china, beijing tax',
    category: 'Regional',
    component: 'ChinaIncomeTaxCalculator'
  },
  {
    slug: 'switzerland-income-tax',
    title: 'Switzerland Income Tax Calculator',
    description: 'Calculate your Swiss net salary including Federal, Cantonal, and Communal taxes along with social security.',
    keywords: 'switzerland tax calculator, swiss salary calculator, canton tax, ahv calculator, zurich tax',
    category: 'Regional',
    component: 'SwitzerlandIncomeTaxCalculator'
  },
  {
    slug: 'singapore-tax',
    title: 'Singapore Income Tax & CPF',
    description: 'Calculate your Singapore take-home pay after CPF contributions and progressive income tax rates.',
    keywords: 'singapore tax calculator, cpf calculator, salary-calculator sg, income tax singapore, take home pay sg',
    category: 'Regional',
    component: 'SingaporeTaxCalculator'
  },
  {
    slug: 'uae-gratuity',
    title: 'UAE Gratuity Calculator',
    description: 'Calculate your end-of-service gratuity in the UAE based on the latest 2022 Labor Law.',
    keywords: 'uae gratuity calculator, end of service benefits uae, gratuity dubai, labor law uae, gratuity calculation limited contract',
    category: 'Regional',
    component: 'UAEGratuityCalculator'
  },
  {
    slug: 'nz-paycheck',
    title: 'New Zealand PAYE Calculator',
    description: 'Estimate your NZ take-home pay after PAYE tax, ACC levy, and KiwiSaver contributions.',
    keywords: 'nz tax calculator, paye calculator nz, kiwisaver calculator, take home pay nz, salary calculator nz',
    category: 'Regional',
    component: 'NZPaycheckCalculator'
  },
  {
    slug: 'india-tax',
    title: 'India Income Tax (New vs Old)',
    description: 'Compare take-home pay under New vs Old Tax Regimes for FY 2024-25 with standard deductions.',
    keywords: 'income tax india, new vs old regime, fy 2024-25 tax, income tax calculator india, sbi tax calculator',
    category: 'Regional',
    component: 'IndiaIncomeTaxCalculator'
  },
  {
    slug: 'ireland-tax',
    title: 'Ireland Income Tax (PAYE)',
    description: 'Estimate your Irish net salary after PAYE, USC, and PRSI deductions for 2024.',
    keywords: 'ireland tax calculator, paye calculator ireland, usc calculator, prsi ireland, take home pay ireland',
    category: 'Regional',
    component: 'IrelandIncomeTaxCalculator'
  },
  {
    slug: 'mexico-isr',
    title: 'Mexico ISR & Paycheck',
    description: 'Calculate your net monthly salary in Mexico after ISR (Income Tax) and IMSS deductions.',
    keywords: 'mexico tax calculator, calculatora de isr, salario neto mexico, isr 2024, imss calculator',
    category: 'Regional',
    component: 'MexicoISRCalculator'
  },
  {
    slug: 'brazil-clt',
    title: 'Brazil CLT Paycheck',
    description: 'Calculate your net monthly salary in Brazil after INSS and IRRF deductions (Salário Líquido).',
    keywords: 'brazil tax calculator, calculo salario liquido, inss 2024, irrf calculator, clt brazil',
    category: 'Regional',
    component: 'BrazilCLTCalculator'
  },
  {
    slug: 'south-africa-tax',
    title: 'South Africa Tax (PAYE)',
    description: 'Calculate your South African net take-home pay including SARS rebates and medical credits.',
    keywords: 'sa tax calculator, sars tax calculator, paye calculator sa, take home pay south africa, tax rebate sa',
    category: 'Regional',
    component: 'SouthAfricaTaxCalculator'
  }
];

export default calculators;
