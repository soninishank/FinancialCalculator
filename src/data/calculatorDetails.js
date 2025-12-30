import React from 'react';

export const calculatorDetails = {
    ruleOf72: {
        title: "Understanding the Rule of 72",
        render: ({ rate, yearsToDouble }) => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Understanding the Rule of 72</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        The <strong>Rule of 72</strong> is a simple, mental math shortcut to estimate the number of years required to double your investment at a given annual fixed interest rate.
                    </p>

                    <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 my-4">
                        <p className="font-semibold text-teal-800 text-center text-lg">
                            Years to Double ≈ 72 ÷ Interest Rate
                        </p>
                    </div>

                    <p className="mb-4">
                        For example, with an annual return of <strong>{rate}%</strong>:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li>
                            The calculation is <strong>72 ÷ {rate}</strong>.
                        </li>
                        <li>
                            This gives approximately <strong>{yearsToDouble} years</strong> to double your money.
                        </li>
                        <li>
                            While the Rule of 72 is an approximation, the actual time (calculated using precise logarithmic formulas) is very close to this estimate for typical interest rates (between 6% and 10%).
                        </li>
                    </ul>
                    <p>
                        This rule applies to any investment with compound interest, helping investors quickly gauge the potential growth of their portfolio without complex calculations.
                    </p>
                </div>
            </div>
        )
    },
    simple_interest: {
        title: "How Simple Interest Works for You",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">When is Simple Interest Used?</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        Simple interest is most common in short-term financial arrangements. Unlike compounding, where interest earns interest, simple interest remains constant based on your initial principal.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <h4 className="font-bold text-indigo-800 mb-2">Common Use Cases</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-indigo-700">
                                <li><strong>Short-term Loans:</strong> Often used for personal or bridge loans.</li>
                                <li><strong>Auto Loans:</strong> Many car loans use simple interest daily methods.</li>
                                <li><strong>Certificates of Deposit (CDs):</strong> Some non-compounding fixed deposits.</li>
                            </ul>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                            <h4 className="font-bold text-amber-800 mb-2">The "Linear" Advantage</h4>
                            <p className="text-sm text-amber-700">
                                Because interest doesn't pile up, it's easier to calculate exactly how much you'll pay or earn. This predictability is great for budgeting fixed-income returns.
                            </p>
                        </div>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2">Tax Tip</h4>
                    <p>
                        Most interest earned on deposits is taxable as "Income from Other Sources" based on your regular tax slab. Always keep aside a portion of your earnings for year-end tax liabilities.
                    </p>
                </div>
            </div>
        )
    },
    compound_interest: {
        title: "The Power of Compounding",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Maximizing Your Wealth with Compounding</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        Compounding is often called the "Eighth Wonder of the World." Its real power comes from <strong>time</strong> and <strong>frequency</strong>. The earlier you start and the more frequently your interest is reinvested, the faster your wealth multiplies.
                    </p>

                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 my-6">
                        <h4 className="font-bold text-emerald-800 mb-2">Why Frequency Matters</h4>
                        <p className="text-sm text-emerald-700">
                            A 10% interest rate compounded <strong>monthly</strong> yields a higher actual return than 10% compounded <strong>yearly</strong>. Our calculator handles these different intervals automatically to show you the "Effective Annual Yield."
                        </p>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2">Strategic Insights</h4>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li><strong>Start Small, Start Early:</strong> Small amounts invested in your 20s can far exceed large amounts invested in your 40s due to the longer "snowball" effect.</li>
                        <li><strong>Inflation Hack:</strong> Compounding is your best defense against inflation. To maintain your lifestyle, your compounding rate must exceed the inflation rate.</li>
                        <li><strong>Reinvestment:</strong> To get the results shown in the table, ensure that you do not withdraw any interest earned during the tenure.</li>
                    </ul>

                    <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                        <h4 className="font-bold text-rose-800 mb-2">A Note on Taxes</h4>
                        <p className="text-sm text-rose-700">
                            Depending on your investment type (Fixed Deposits vs. Mutual Funds), you might be taxed on interest every year or only upon withdrawal (LTCG). Check our Tax toggle to see how this impacts your net wealth.
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    loanEmi: {
        title: "Understanding Loans",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Understanding Loans</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        A <strong>Details Loan Analysis</strong> helps you understand the variables affecting your debt.
                    </p>

                    <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 my-4">
                        <p className="font-medium text-teal-800 mb-2">
                            Think of your EMI as having two parts:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-teal-700">
                            <li><strong>Principal Part:</strong> Reduces your actual loan balance.</li>
                            <li><strong>Interest Part:</strong> The cost you pay to the bank.</li>
                        </ul>
                        <p className="text-sm text-teal-600 mt-2">
                            In the early years, you pay mostly interest. As time goes on, you pay more of the principal.
                        </p>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2 mt-6">How "Reverse EMI" Helps You</h4>
                    <p className="mb-4">
                        Usually, people ask "What is the EMI for a ₹50 Lakh loan?".
                    </p>
                    <p className="mb-4">
                        But the smarter question is: <strong>"How much loan can I get if I can afford ₹30,000 per month?"</strong>
                    </p>
                    <p className="mb-4">
                        Our <strong>Calculate Loan Amount</strong> mode does exactly this. It calculates your <strong>Maximum Budget</strong> based on your monthly savings capacity.
                    </p>

                    <h4 className="font-semibold text-gray-800 mb-2 mt-6">Quick Tips</h4>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Shorter Tenure = Less Interest:</strong> You pay higher EMI, but you become debt-free faster and save huge amounts on interest.</li>
                        <li><strong>Extra Payments Strategy:</strong> Even one extra EMI per year can reduce your loan tenure by years!</li>
                    </ul>
                </div>
            </div>
        )
    },
    topUpLoan: {
        title: "Understanding Top-Up Loans",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Understanding Top-Up Loans</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        A <strong>Top-Up Loan</strong> is an additional loan you take on top of your existing home loan.
                    </p>

                    <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 my-4">
                        <p className="font-medium text-teal-800 mb-2">
                            Why choose a Top-Up Loan?
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-teal-700">
                            <li><strong>Cheaper than Personal Loans:</strong> Interest rates are usually much lower (closer to home loan rates).</li>
                            <li><strong>Longer Tenure:</strong> You can repay it over a long period (often 10-20 years), reducing your monthly burden.</li>
                            <li><strong>No Security Needed:</strong> It uses your existing home as collateral.</li>
                        </ul>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2 mt-6">Smart Usage Tips</h4>
                    <p className="mb-4">
                        Use it for high-value expenses like <strong>Home Renovation, Medical Emergencies, or Weddings</strong>. Avoid using it for daily expenses as it increases your long-term debt.
                    </p>
                </div>
            </div>
        )
    },
    swp: {
        title: "Understanding SWP (Systematic Withdrawal Plan)",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Understanding SWP</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        <strong>Systematic Withdrawal Plan (SWP)</strong> allows you to withdraw a fixed amount of money from your investment (like Mutual Funds) every month.
                    </p>

                    <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 my-4">
                        <p className="font-medium text-teal-800 mb-2">
                            How is it different from a Bank FD?
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-teal-700">
                            <li><strong>Growth on Balance:</strong> While you withdraw money, the remaining money <em>continues to grow</em>.</li>
                            <li><strong>Inflation Protection:</strong> If your returns (e.g., 10%) are higher than withdrawals, your money lasts longer.</li>
                        </ul>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2 mt-6">How to use this calculator?</h4>
                    <p className="mb-4">
                        Enter your <strong>Initial Corpus</strong> (Total Investment) and how much you want to <strong>Withdraw Monthly</strong>.
                    </p>
                    <p className="mb-4">
                        The calculator will show you:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Final Corpus:</strong> How much money is left at the end.</li>
                        <li><strong>Depletion Date:</strong> If you withdraw too much, when will your money run out?</li>
                    </ul>
                </div>
            </div>
        )
    },
    compareLoans: {
        title: "Flat Rate vs Reducing Balance",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Flat Rate vs Reducing Balance</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        When taking a loan, the <strong>Interest Rate</strong> isn't the only thing that matters. The <strong>Calculation Method</strong> is equally important.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                        <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                            <h4 className="font-bold text-rose-800 mb-2">Flat Interest Rate</h4>
                            <p className="text-sm text-rose-700 mb-2">
                                Interest is calculated on the <strong>entire principal amount</strong> for the full tenure.
                            </p>
                            <p className="text-sm font-semibold text-rose-800">
                                ⚠️ Looks cheaper (e.g., 5%) but is actually much more expensive (~9-10% effective).
                            </p>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <h4 className="font-bold text-emerald-800 mb-2">Reducing Balance Rate</h4>
                            <p className="text-sm text-emerald-700 mb-2">
                                Interest is calculated only on the <strong>remaining outstanding balance</strong> every month.
                            </p>
                            <p className="text-sm font-semibold text-emerald-800">
                                ✅ This is the standard for Home Loans and is transparent.
                            </p>
                        </div>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2">The "Verdict" Feature</h4>
                    <p className="mb-4">
                        Our calculator specifically highlights the <strong>Difference</strong> between the two.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>It shows you the <strong>Effective Interest Rate</strong> of a Flat Rate loan so you can compare apples to apples.</li>
                        <li>It clearly tells you how much <strong>extra interest</strong> you would pay with a Flat Rate scheme.</li>
                    </ul>
                </div>
            </div>
        )
    },
    emiComparison: {
        title: "Compare Multiple Loan Estimates",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Why Compare Loans?</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        Even a small difference in <strong>Interest Rate</strong> or <strong>Tenure</strong> can make a huge difference in the total amount you pay back.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <h4 className="font-bold text-indigo-800 mb-2">Interest Rate Impact</h4>
                            <p className="text-sm text-indigo-700">
                                A 0.5% difference on a ₹50 Lakh loan for 20 years can save you over <strong>₹3.5 Lakhs</strong> in interest payments!
                            </p>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <h4 className="font-bold text-emerald-800 mb-2">Tenure Impact</h4>
                            <p className="text-sm text-emerald-700">
                                Shorter tenure increases your EMI but drastically reduces total interest. Use this tool to find your sweet spot.
                            </p>
                        </div>
                    </div>

                    <p>
                        Add up to 3 loan scenarios to see them side-by-side. We'll highlight the cheapest option for you.
                    </p>
                </div>
            </div>
        )
    },
    advancedHomeLoan: {
        title: "Deep Dive: Home Loan Planning",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Why use the Advanced Calculator?</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        A standard EMI calculator only tells you the monthly repayment. But <strong>Home Ownership</strong> involves many more costs and variables.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <h4 className="font-bold text-indigo-800 mb-2">Hidden Costs</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-indigo-700">
                                <li><strong>Property Taxes:</strong> Recurring yearly cost often ignored.</li>
                                <li><strong>Home Insurance:</strong> Mandatory for many loans.</li>
                                <li><strong>Maintenance:</strong> Monthly upkeep costs.</li>
                            </ul>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <h4 className="font-bold text-emerald-800 mb-2">Prepayment Power</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-emerald-700">
                                <li><strong>Strategic Prepayments:</strong> Adding just 1 extra EMI per year can shave off years from your tenure.</li>
                                <li><strong>Bonus Utilization:</strong> Use yearly bonuses to prepay chunks.</li>
                            </ul>
                        </div>
                    </div>

                    <p>
                        This calculator gives you the <strong>Real Total Cost of Ownership</strong>, not just the loan interest.
                    </p>
                </div>
            </div>
        )
    },
    cagr_calculator: {
        title: "Mastering CAGR",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Why CAGR Matters</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        The <strong>Compound Annual Growth Rate (CAGR)</strong> is the best way to measure how an investment has performed over time. Unlike simple returns, CAGR accounts for the effect of compounding, giving you the "smoothed" annual return.
                    </p>

                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 my-6">
                        <h4 className="font-bold text-indigo-800 mb-2">CAGR vs. Absolute Return</h4>
                        <p className="text-sm text-indigo-700">
                            If your ₹1 Lakh becomes ₹2 Lakh in 5 years, your absolute return is 100%. But your CAGR is about 14.87%. This tells you how hard your money worked for you <strong>every single year</strong>.
                        </p>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2 mt-6">How to use this tool</h4>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li><strong>Performance Check:</strong> Use it to compare different mutual funds or stocks over the same period.</li>
                        <li><strong>Strategy Validation:</strong> See if your long-term investments are actually beating inflation.</li>
                        <li><strong>Flexibility:</strong> Calculate based on exact dates (like from a bank statement) or simple duration.</li>
                    </ul>

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                        <h4 className="font-bold text-amber-800 mb-2">Pro Tip</h4>
                        <p className="text-sm text-amber-700">
                            CAGR is great for historical analysis, but it assumes growth was steady. In reality, markets go up and down. Always look at the <strong>Growth Schedule</strong> below to see the simulated path of your investment.
                        </p>
                    </div>
                </div>
            </div>
        )
    }
};
