import React from 'react';
import { calculatorFaqs } from './seoMetadata';

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
    'target-amount-calculator': {
        title: "Planning for a Target Amount",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">How to Reach Your Target Amount?</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        Most calculators tell you "If you invest X, you get Y". But in real life, we usually start with the goal: <strong>"I need ₹50 Lakhs for my child's education in 15 years."</strong>
                    </p>
                    <p className="mb-4">
                        This <strong>Target Amount Calculator</strong> works backwards. You simply enter your Goal Amount and Time Horizon, and it calculates the precise monthly SIP or Lump Sum investment required.
                    </p>

                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 my-6">
                        <h4 className="font-bold text-indigo-800 mb-2">The Math Behind It</h4>
                        <p className="text-sm text-indigo-700 font-mono mb-2">
                            t = ln(Target / Principal) / ln(1 + Rate)
                        </p>
                        <p className="text-sm text-indigo-700">
                            Where <strong>ln</strong> is the natural logarithm. It essentially calculates the number of compounding periods required for the growth factor to bridge the gap between where you are and where you want to be.
                        </p>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2 mt-6">Factors That Reduce Time</h4>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li><strong>Higher Interest Rate:</strong> Obviously, earning 15% gets you there faster than 10%.</li>
                        <li><strong>Compounding Frequency:</strong> This calculator assumes annual compounding. If your investment compounds quarterly or monthly, you might reach your goal slightly faster.</li>
                        <li><strong>Starting Bigger:</strong> The closer your principal is to the target, the less time it takes (diminishing returns on time).</li>
                    </ul>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 my-6">
                        <h4 className="font-bold text-blue-800 mb-2">Time to Goal vs. Target Amount Calculator</h4>
                        <p className="text-sm text-blue-700 mb-2">
                            It's easy to confuse the two, but they answer different questions:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                            <li><strong>Time to Goal Calculator:</strong> I have ₹5 Lakhs. How long until it becomes ₹10 Lakhs? (Solves for Time)</li>
                            <li><strong>Target Amount Calculator:</strong> I want ₹10 Lakhs in 5 years. How much should I invest now? (Solves for Investment Amount)</li>
                        </ul>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                        <h4 className="font-bold text-amber-800 mb-2">Rule of 72 Approximation</h4>
                        <p className="text-sm text-amber-700">
                            For a quick mental check, use the Rule of 72. Divide 72 by your interest rate to see how many years it takes to <strong>double</strong> your money.
                            <br />Example: At 12%, money doubles in ~6 years (72/12). If your target is 4x your principal, it will take ~12 years (two doublings).
                        </p>
                    </div>
                </div>
            </div >
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
                        But the smarter question is: <strong>How much loan can I get if I can afford ₹30,000 per month?</strong>
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
    // old swp entry removed
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
    'cagr-calculator': {
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
    },
    xirr_calculator: {
        title: "Mastering XIRR",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Understanding XIRR</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        <strong>XIRR (Extended Internal Rate of Return)</strong> is the most accurate way to measure returns when you have irregular cash flows—like SIPs, lump sum investments, partial withdrawals, or any combination of deposits and redemptions at different times.
                    </p>

                    <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 my-6">
                        <h4 className="font-bold text-teal-800 mb-2">Why XIRR is Powerful</h4>
                        <p className="text-sm text-teal-700 mb-2">
                            Unlike CAGR (which only works for a single investment and redemption), XIRR handles:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-teal-700">
                            <li><strong>Multiple deposits</strong> at different dates (like monthly SIPs)</li>
                            <li><strong>Partial withdrawals</strong> during the investment period</li>
                            <li><strong>Irregular investments</strong> (different amounts at different times)</li>
                            <li><strong>Exact date precision</strong> for accurate annualized returns</li>
                        </ul>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2 mt-6">XIRR vs CAGR: When to Use What?</h4>
                    <div className="overflow-x-auto my-4">
                        <table className="min-w-full border border-gray-200 text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="border border-gray-200 px-4 py-2 text-left font-bold text-gray-700">Scenario</th>
                                    <th className="border border-gray-200 px-4 py-2 text-left font-bold text-teal-700">Use XIRR</th>
                                    <th className="border border-gray-200 px-4 py-2 text-left font-bold text-indigo-700">Use CAGR</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-200 px-4 py-2">Single lump sum investment</td>
                                    <td className="border border-gray-200 px-4 py-2 text-center">-</td>
                                    <td className="border border-gray-200 px-4 py-2 text-center">✅</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="border border-gray-200 px-4 py-2">Monthly SIP</td>
                                    <td className="border border-gray-200 px-4 py-2 text-center">✅</td>
                                    <td className="border border-gray-200 px-4 py-2 text-center">-</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-200 px-4 py-2">Irregular investments</td>
                                    <td className="border border-gray-200 px-4 py-2 text-center">✅</td>
                                    <td className="border border-gray-200 px-4 py-2 text-center">-</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="border border-gray-200 px-4 py-2">Investment with withdrawals</td>
                                    <td className="border border-gray-200 px-4 py-2 text-center">✅</td>
                                    <td className="border border-gray-200 px-4 py-2 text-center">-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2 mt-6">Real-World Use Cases</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <h5 className="font-bold text-indigo-800 mb-2">📊 Mutual Fund SIPs</h5>
                            <p className="text-sm text-indigo-700">
                                Calculate the true annualized return of your monthly SIP investments. XIRR accounts for each installment's timing and amount.
                            </p>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <h5 className="font-bold text-emerald-800 mb-2">🏠 Real Estate</h5>
                            <p className="text-sm text-emerald-700">
                                Track property investment with down payment, EMIs, maintenance costs, rental income, and final sale value.
                            </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                            <h5 className="font-bold text-purple-800 mb-2">💼 Business Investments</h5>
                            <p className="text-sm text-purple-700">
                                Measure ROI for businesses with multiple capital injections and profit withdrawals over time.
                            </p>
                        </div>
                        <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                            <h5 className="font-bold text-rose-800 mb-2">📈 Stock Portfolios</h5>
                            <p className="text-sm text-rose-700">
                                Track returns when you buy stocks at different times, receive dividends, and sell partially.
                            </p>
                        </div>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2 mt-6">How to Interpret Your XIRR</h4>
                    <div className="bg-gradient-to-r from-red-50 via-yellow-50 via-green-50 to-emerald-50 p-4 rounded-xl border border-gray-200 my-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs font-bold">
                            <div>
                                <div className="text-red-700 text-lg mb-1">&lt; 7%</div>
                                <div className="text-red-600">Below Average</div>
                                <div className="text-gray-500 text-[10px] mt-1">Consider FDs</div>
                            </div>
                            <div>
                                <div className="text-amber-700 text-lg mb-1">7-10%</div>
                                <div className="text-amber-600">Average</div>
                                <div className="text-gray-500 text-[10px] mt-1">Beating FDs</div>
                            </div>
                            <div>
                                <div className="text-green-700 text-lg mb-1">10-15%</div>
                                <div className="text-green-600">Good</div>
                                <div className="text-gray-500 text-[10px] mt-1">Market returns</div>
                            </div>
                            <div>
                                <div className="text-emerald-700 text-lg mb-1">&gt; 15%</div>
                                <div className="text-emerald-600">Excellent</div>
                                <div className="text-gray-500 text-[10px] mt-1">Outperforming</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 my-4">
                        <h4 className="font-bold text-blue-800 mb-2">📌 Benchmark Comparisons</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-blue-700">
                            <li><strong>Bank FD:</strong> ~6-7% per year (safe, guaranteed)</li>
                            <li><strong>Inflation:</strong> ~5-6% per year (your minimum target)</li>
                            <li><strong>Nifty 50 (20Y CAGR):</strong> ~12% per year (equity benchmark)</li>
                            <li><strong>Gold (20Y CAGR):</strong> ~9% per year (alternative asset)</li>
                        </ul>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2 mt-6">Pro Tips for Accurate XIRR</h4>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li><strong>Use Exact Dates:</strong> XIRR is date-sensitive. Use the actual transaction dates from your statements for precision.</li>
                        <li><strong>Negative for Investments:</strong> Money going OUT (deposits) should be negative. Money coming IN (redemptions/current value) should be positive.</li>
                        <li><strong>Include Current Value:</strong> Add today's portfolio value as a positive "return" with today's date to see your current XIRR.</li>
                        <li><strong>Don't Mix Investments:</strong> Calculate XIRR separately for each fund/stock to identify top performers.</li>
                        <li><strong>Minimum 2 Transactions:</strong> You need at least one investment and one return/current value to calculate XIRR.</li>
                    </ul>

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                        <h4 className="font-bold text-amber-800 mb-2">⚠️ Important Notes</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-amber-700">
                            <li>XIRR assumes returns are reinvested at the same rate (which may not be realistic)</li>
                            <li>Very short investment periods (less than 1 year) can show misleading annualized rates</li>
                            <li>XIRR doesn't account for risk or volatility—only returns</li>
                            <li>Tax implications vary by investment type and holding period</li>
                        </ul>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2 mt-6">Example: Monthly SIP</h4>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm">
                        <p className="mb-2 font-medium text-gray-700">Invested ₹10,000/month for 24 months = ₹2,40,000 total</p>
                        <p className="mb-2 text-gray-600">Current value after 2 years = ₹2,90,000</p>
                        <p className="font-bold text-teal-700">XIRR = ~18.5% per year 🎉</p>
                        <p className="text-xs text-gray-500 mt-2">This means your investments grew at an annualized rate of 18.5%, accounting for the timing of each monthly deposit.</p>
                    </div>
                </div>
            </div>
        )
    },
    carLoanEMI: {
        title: "Car Loan EMI Calculator Guide",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Drive Your Dreams with Clarity</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-6">
                        India is now one of the world's largest car markets, with steady growth year after year. As the demand for vehicles rises, the need for a reliable <strong>Car Loan EMI Calculator</strong> has become essential for informed financial planning.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                            <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                                <span className="p-1.5 bg-blue-500 text-white rounded-lg text-xs">01</span>
                                Why Use This Calculator?
                            </h4>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 text-sm text-blue-800">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                    <strong>Instant Clarity:</strong> See your monthly commitment in seconds.
                                </li>
                                <li className="flex items-start gap-2 text-sm text-blue-800">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                    <strong>Plan Better:</strong> Adjust tenure and interest to see what fits your budget.
                                </li>
                                <li className="flex items-start gap-2 text-sm text-blue-800">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                    <strong>Error-Free:</strong> Skip the complex manual math and get 100% accuracy.
                                </li>
                            </ul>
                        </div>

                        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                            <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                                <span className="p-1.5 bg-emerald-500 text-white rounded-lg text-xs">02</span>
                                Financial Breakdown
                            </h4>
                            <p className="text-sm text-emerald-800 leading-relaxed">
                                Our tool provides a comprehensive breakdown of your loan, including the <strong>Total Interest Payable</strong> and the <strong>Total Cost of Ownership</strong>. This ensures no surprises when you visit the dealership.
                            </p>
                        </div>
                    </div>

                    <h4 className="font-bold text-gray-800 mb-4">The Standard Calculation Formula</h4>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 font-mono text-center">
                        <p className="text-lg font-bold text-slate-800">E = P × R × (1+R)ⁿ / ((1+R)ⁿ - 1)</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 text-xs text-slate-600 font-sans">
                            <div><strong>E:</strong> Monthly EMI</div>
                            <div><strong>P:</strong> Principal Amount</div>
                            <div><strong>R:</strong> Monthly Interest Rate</div>
                            <div><strong>n:</strong> Tenure in Months</div>
                        </div>
                    </div>

                    <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100 mb-8">
                        <h4 className="font-bold text-teal-900 mb-3">Understanding Amortization</h4>
                        <p className="text-sm text-teal-800 leading-relaxed">
                            An amortization schedule is your roadmap to being debt-free. It shows how each payment is split between the Interest (cost of borrowing) and the Principal (loan repayment). In the early years, interest dominates; as the balance drops, more of your money goes toward the principal.
                        </p>
                    </div>

                    {/* FAQ SECTION */}
                    <div className="mt-12 space-y-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(calculatorFaqs['car-loan-emi'] || []).map((faq, i) => (
                                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                                    <h5 className="font-bold text-gray-800 text-sm mb-2">Q: {faq.q}</h5>
                                    <p className="text-gray-600 text-xs leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    'pure-sip': {
        title: "Mastering Your Wealth with SIP",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Systematic Investment Plan (SIP) is Your Best Friend</h2>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-6">
                        A Systematic Investment Plan (SIP) is a disciplined approach to wealth creation that allows you to invest a fixed sum of money at regular intervals—usually monthly—into mutual fund schemes. Instead of trying to "time the market," which often leads to emotional stress and poor financial decisions, SIP leverages the twin powers of <strong>Rupee Cost Averaging</strong> and <strong>Compounding</strong>.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                        <div className="bg-teal-50 p-5 rounded-2xl border border-teal-100">
                            <h3 className="text-lg font-bold text-teal-900 mb-3">Rupee Cost Averaging</h3>
                            <p className="text-sm text-teal-800 leading-relaxed">
                                When you invest a fixed amount regularly, you automatically buy more units when the market is low and fewer units when it is high. Over time, this lowers your average cost per unit, making your portfolio resilient to volatility.
                            </p>
                        </div>
                        <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                            <h3 className="text-lg font-bold text-indigo-900 mb-3">The Power of Choice</h3>
                            <p className="text-sm text-indigo-800 leading-relaxed">
                                SIPs are incredibly flexible. You can start with as little as ₹500 per month and increase (Step-up) or pause your contributions as your financial situation changes.
                            </p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mt-12 mb-6">How to Use the SIP Calculator Efficiently</h2>
                    <p className="mb-4">
                        Our advanced SIP calculator is designed to provide you with a holistic view of your financial future. Follow these steps to get the most out of it:
                    </p>
                    <ul className="list-decimal pl-5 space-y-4 mb-8">
                        <li><strong>Set Your Monthly Goal:</strong> Decide on a budget you can comfortably commit to every month without failing.</li>
                        <li><strong>Choose Your Tenure:</strong> Wealth is built over decades. Use the slider to see how increasing your tenure by just 5 years can often double your final corpus.</li>
                        <li><strong>Adjust Expected Returns:</strong> While stock markets have historically given 12-15% over long periods, it's safer to model with 10-12% for a conservative estimate.</li>
                        <li><strong>Factor in Taxes & Inflation:</strong> Use our unique toggles to see the "Real Value" of your money. Remember, ₹1 Crore today will buy much less 20 years from now.</li>
                    </ul>

                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 mb-12">
                        <h3 className="text-lg font-bold text-amber-900 mb-2">💡 Pro Tip: The 15-15-15 Rule</h3>
                        <p className="text-sm text-amber-800">
                            If you invest <strong>₹15,000</strong> per month for <strong>15 years</strong> at an annual return of <strong>15%</strong>, your corpus will grow to approximately <strong>₹1 Crore</strong>. This is the magic of long-term compounding!
                        </p>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Calculated SIP FAQs</h2>
                    <div className="space-y-4">
                        {(calculatorFaqs['pure-sip'] || []).map((faq, i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 italic">
                                <p className="font-bold text-gray-800 mb-2">Q: {faq.q}</p>
                                <p className="text-gray-600 text-sm">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    },
    'lump-sum': {
        title: "Wealth Growth via Lump Sum Investment",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">The Power of One-Time Investment</h2>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-6">
                        A Lump Sum investment is the act of investing a large chunk of money at once into a specific financial instrument, typically mutual funds or stocks. This strategy is ideal when you receive a windfall—such as a yearly bonus, inheritance, or profits from the sale of an asset—and want that capital to start working for you immediately.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-12 mb-6">SIP vs. Lump Sum: Which is Better?</h2>
                    <div className="overflow-x-auto my-6">
                        <table className="min-w-full border-collapse border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Feature</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Lump Sum</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">SIP</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-2 font-medium">Entry Point</td>
                                    <td className="border border-gray-300 px-4 py-2 text-rose-600 font-semibold">Critical</td>
                                    <td className="border border-gray-300 px-4 py-2 text-teal-600 font-semibold">Irrelevant</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-2 font-medium">Risk</td>
                                    <td className="border border-gray-300 px-4 py-2">High (Market Volatility)</td>
                                    <td className="border border-gray-300 px-4 py-2">Low (Averaged)</td>
                                </tr>
                                <tr>
                                    <td className="border border-gray-300 px-4 py-2 font-medium">Ideal For</td>
                                    <td className="border border-gray-300 px-4 py-2">Windfalls/Bonuses</td>
                                    <td className="border border-gray-300 px-4 py-2">Regular Salary</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mt-12 mb-6">Strategic Use of Lump Sum Calculator</h2>
                    <p className="mb-4">
                        Our calculator helps you visualize the trajectory of your wealth. By providing an initial amount and an expected return rate, you can see how the "interest on interest" effect takes over.
                    </p>
                    <ul className="list-disc pl-5 space-y-3 mb-8">
                        <li><strong>Longer Horizons:</strong> Even if you invest during a market peak, a long-term horizon (7-10+ years) usually smooths out the entry-point risk.</li>
                        <li><strong>Tax Planning:</strong> Lump sum equity investments held for over a year qualify for Long Term Capital Gains (LTCG) tax, which is often more efficient than short-term trading.</li>
                        <li><strong>The 'Rule of 72':</strong> Quickly estimate how long it will take for your lump sum to double. If you expect a 12% return, your money doubles in about 6 years (72/12).</li>
                    </ul>

                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-12">
                        <h3 className="text-lg font-bold text-blue-900 mb-2">🛡️ Mitigating Risk: The STP Strategy</h3>
                        <p className="text-sm text-blue-800">
                            If you are afraid of investing a large amount during market highs, consider a <strong>Systematic Transfer Plan (STP)</strong>. Invest the lump sum in a low-risk liquid fund and transfer it into an equity fund in small portions every month.
                        </p>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Lump Sum FAQs</h2>
                    <div className="space-y-4">
                        {(calculatorFaqs['lump-sum'] || []).map((faq, i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 italic">
                                <p className="font-bold text-gray-800 mb-2">Q: {faq.q}</p>
                                <p className="text-gray-600 text-sm">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    },
    'step-up-sip': {
        title: "The Exponential Power of Step-Up SIP",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Why You Should 'Step-Up' Your Investments</h2>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-6">
                        A <strong>Step-Up SIP</strong> (also known as a Top-up SIP) is a strategy where you increase your SIP amount periodically—usually once a year. This increase is typically aligned with your annual salary hikes or business profit growth. While a normal SIP is great for consistency, a Step-Up SIP is the "secret weapon" for achieving massive financial goals much faster.
                    </p>

                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 my-8">
                        <h3 className="text-lg font-bold text-indigo-900 mb-2">The Difference is Staggering</h3>
                        <p className="text-sm text-indigo-800 leading-relaxed">
                            Consider two investors, A and B, both starting with ₹10,000/month for 20 years at 12%.
                            <br />- <strong>Investor A (Normal SIP):</strong> Final corpus ~₹1 Crore.
                            <br />- <strong>Investor B (10% Annual Step-Up):</strong> Final corpus ~₹2.2 Crores!
                            <br />By just increasing the investment as their income grows, Investor B more than <strong>doubled</strong> their wealth compared to Investor A.
                        </p>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mt-12 mb-6">How to Optimize Your Step-Up SIP</h2>
                    <p className="mb-4">
                        To get the most out of your increasing contributions, keep these strategies in mind:
                    </p>
                    <ul className="list-disc pl-5 space-y-3 mb-8">
                        <li><strong>Match Your Hike:</strong> If you get a 10% salary hike, aim to increase your SIP by 10% too. This prevents "lifestyle creep" from eating into your potential savings.</li>
                        <li><strong>Start Small:</strong> You don't need a huge starting amount. Even a ₹2,000 SIP with a 10% yearly increase grows significantly over time.</li>
                        <li><strong>Inflation Neutralizer:</strong> Inflation reduces the value of your money. A Step-Up SIP helps your savings keep pace with rising costs by ensuring you invest more as time goes by.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Step-Up SIP FAQs</h2>
                    <div className="space-y-4">
                        {(calculatorFaqs['step-up-sip'] || []).map((faq, i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 italic">
                                <p className="font-bold text-gray-800 mb-2">Q: {faq.q}</p>
                                <p className="text-gray-600 text-sm">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    },
    'recurring-deposit': {
        title: "Building Habits with Recurring Deposits (RD)",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">The Safety and Discipline of an RD</h2>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-6">
                        A <strong>Recurring Deposit (RD)</strong> is one of the most popular risk-free investment options in India. It is offered by almost all banks and post offices. It allows you to deposit a fixed amount every month for a pre-determined period, earning a fixed interest rate.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                            <h3 className="text-lg font-bold text-emerald-900 mb-3">Guaranteed Returns</h3>
                            <p className="text-sm text-emerald-800 leading-relaxed">
                                Unlike SIPs in mutual funds, an RD guarantees your maturity amount. The interest rate is fixed at the time of opening and does not change regardless of market conditions.
                            </p>
                        </div>
                        <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
                            <h3 className="text-lg font-bold text-amber-900 mb-3">Goal-Based Savings</h3>
                            <p className="text-sm text-amber-800 leading-relaxed">
                                RD is perfect for short-to-medium term goals like buying a gadget, a vacation, or building an emergency fund.
                            </p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mt-12 mb-6">RD Interest Calculation & Compounding</h2>
                    <p className="mb-4">
                        Most Indian banks compound RD interest <strong>quarterly</strong>. This means you earn interest on your interest every three months. Our calculator uses this standard formula to give you the exact maturity value.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Recurring Deposit FAQs</h2>
                    <div className="space-y-4">
                        {(calculatorFaqs['recurring-deposit'] || []).map((faq, i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 italic">
                                <p className="font-bold text-gray-800 mb-2">Q: {faq.q}</p>
                                <p className="text-gray-600 text-sm">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    },
    'fixed-deposit': {
        title: "Security and Growth with Fixed Deposits (FD)",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Fixed Deposits are an Institutional Favorite</h2>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-6">
                        A <strong>Fixed Deposit (FD)</strong> is the bedrock of conservative financial planning in India. It offers a higher rate of interest than a regular savings account and provides absolute certainty regarding the maturity amount. Whether you are a senior citizen seeking monthly income or a young professional building a safety net, FDs offer unmatched peace of mind.
                    </p>

                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 my-8">
                        <h3 className="text-lg font-bold text-blue-900 mb-2">The Comfort of Predictability</h3>
                        <p className="text-sm text-blue-800 leading-relaxed">
                            With an FD, your interest rate is locked in for the entire tenure. Even if market interest rates fall, your bank is contractually obligated to pay you the agreed-upon rate. This makes it an ideal tool for goals where capital preservation is more important than aggressive growth.
                        </p>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mt-12 mb-6">Maximizing Your FD Returns</h2>
                    <ul className="list-disc pl-5 space-y-3 mb-8">
                        <li><strong>Laddering Strategy:</strong> Instead of putting all your money in one FD, split it into multiple deposits with different tenures (1yr, 2yr, 3yr). This ensures regular liquidity and allows you to reinvest at potentially higher rates.</li>
                        <li><strong>Cumulative vs. Non-Cumulative:</strong> Choose 'Cumulative' if you want to maximize wealth through compounding. Choose 'Non-Cumulative' if you need monthly or quarterly payouts to cover expenses.</li>
                        <li><strong>Senior Citizen Benefits:</strong> Most banks offer an additional 0.50% to 0.75% interest rate to senior citizens, significantly boosting the final maturity value.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Fixed Deposit FAQs</h2>
                    <div className="space-y-4">
                        {(calculatorFaqs['fixed-deposit'] || []).map((faq, i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 italic">
                                <p className="font-bold text-gray-800 mb-2">Q: {faq.q}</p>
                                <p className="text-gray-600 text-sm">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    },
    'ppf-calculator': {
        title: "PPF: The Gold Standard of Long-Term Savings",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">The Power of EEE (Exempt-Exempt-Exempt)</h2>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-6">
                        The <strong>Public Provident Fund (PPF)</strong> is arguably the best long-term savings tool for Indian citizens. It is backed by the Government of India, making it completely risk-free. Its primary attraction is the EEE status: your investment is tax-deductible, the interest earned is tax-free, and the final maturity amount is also tax-free.
                    </p>

                    <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100 my-8">
                        <h3 className="text-lg font-bold text-teal-900 mb-2">Compounding at its Best</h3>
                        <p className="text-sm text-teal-800 leading-relaxed">
                            PPF has a 15-year lock-in period, which is its greatest strength. It forces long-term discipline. By compounding interest annually, a small contribution can grow into a significant retirement corpus over 15 to 25 years (with 5-year extensions).
                        </p>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mt-12 mb-6">The 'April 5th' Rule</h2>
                    <p className="mb-4">
                        To maximize your PPF returns, always try to deposit your annual contribution between <strong>April 1st and April 5th</strong>. This ensures you earn interest for the entire financial year on your new deposit, as the interest is calculated on the minimum balance between the 5th and the end of the month.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-800 mb-6">PPF FAQs</h2>
                    <div className="space-y-4">
                        {(calculatorFaqs['ppf-calculator'] || []).map((faq, i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 italic">
                                <p className="font-bold text-gray-800 mb-2">Q: {faq.q}</p>
                                <p className="text-gray-600 text-sm">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    },
    'swp-calculator': {
        title: "Creating Monthly Income with SWP",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Systematic Withdrawal Plan (SWP) Explained</h2>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-6">
                        While SIP is for wealth creation, <strong>Systematic Withdrawal Plan (SWP)</strong> is for wealth consumption. It allows you to withdraw a fixed amount from your mutual fund investments at regular intervals. It is widely considered the most tax-efficient way to generate a "monthly salary" during retirement.
                    </p>

                    <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 my-8">
                        <h3 className="text-lg font-bold text-rose-900 mb-2">SWP vs. Dividends</h3>
                        <p className="text-sm text-rose-800 leading-relaxed">
                            Unlike dividends, which are controlled by the fund house and are fully taxable at your slab rate, an SWP gives you control. You choose the amount and the date. More importantly, only the "gain" portion of your withdrawal is taxed, not the entire amount, making it significantly more efficient.
                        </p>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mt-12 mb-6">Managing the 'Reverse Compounding' Risk</h2>
                    <p className="mb-4">
                        The biggest risk with SWP is withdrawing too much too fast. If your withdrawal rate is higher than your portfolio's growth rate, your principal will start depleting. This is known as negative amortization or reverse compounding.
                    </p>
                    <ul className="list-disc pl-5 space-y-3 mb-8">
                        <li><strong>Withdrawal Rate:</strong> Aim to keep your SWP rate around 4-6% of your initial corpus to ensure your capital remains intact or continues to grow.</li>
                        <li><strong>Cash Buffer:</strong> Keep 1-2 years of withdrawal amount in a liquid fund to avoid selling equity units during market crashes.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-800 mb-6">SWP FAQs</h2>
                    <div className="space-y-4">
                        {(calculatorFaqs['swp-calculator'] || []).map((faq, i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 italic">
                                <p className="font-bold text-gray-800 mb-2">Q: {faq.q}</p>
                                <p className="text-gray-600 text-sm">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }
};
