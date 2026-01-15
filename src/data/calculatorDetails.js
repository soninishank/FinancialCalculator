import React from 'react';
import { calculatorFaqs } from './seoMetadata';

export const calculatorDetails = {
    'rule-of-72': {
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
    'simple-interest': {
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
    'compound-interest': {
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
    'time-to-goal': {
        title: "How Long to Reach Your Financial Goal?",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Strategy: Lumpsum vs. SIP for Your Goal</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-6">
                        When you have a target amount in mind—whether it's ₹10 Lakhs for a new car or ₹1 Crore for retirement—the most common question is: <strong>"How long will it take?"</strong>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                        <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
                            <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                                <span className="p-1.5 bg-blue-500 text-white rounded-lg text-xs">A</span>
                                Lumpsum Path
                            </h4>
                            <p className="text-sm text-blue-800 leading-relaxed">
                                Ideal if you already have a corpus. This path calculates the time required for your initial capital to grow to the target through 100% compounding.
                            </p>
                        </div>

                        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                            <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                                <span className="p-1.5 bg-emerald-500 text-white rounded-lg text-xs">B</span>
                                SIP Path
                            </h4>
                            <p className="text-sm text-emerald-800 leading-relaxed">
                                Perfect for salaried professionals. It calculates how many months of regular monthly contributions (at your chosen rate) are needed to hit the target.
                            </p>
                        </div>
                    </div>

                    <h4 className="font-bold text-gray-800 mb-4">The Mathematical Logic</h4>
                    <p className="mb-4">
                        This calculator solves for <strong>Time (n)</strong> using the standard future value formulas. For a Lumpsum, it uses logs to find when the growth factor bridges the gap. For SIP, it solves the "Annuity Due" formula where interest is calculated at the beginning of each period.
                    </p>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8 font-mono text-center">
                        <p className="text-sm text-slate-800 font-bold mb-2">For Lumpsum Growth:</p>
                        <p className="text-lg font-bold text-slate-800">n = ln(Target / Principal) / ln(1 + Rate)</p>
                    </div>

                    <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100 mb-8">
                        <h4 className="font-bold text-teal-900 mb-3">Goal Reachability</h4>
                        <p className="text-sm text-teal-800 leading-relaxed">
                            Our calculator also features a <strong>"Winner Strategy"</strong> comparison. It highlights which method gets you to your goal faster and explicitly identifies if a goal is mathematically unreachable (e.g., if you have zero investment but a positive target).
                        </p>
                    </div>

                    {/* FAQ SECTION */}
                    <div className="mt-12 space-y-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(calculatorFaqs['time-duration-calculator'] || []).map((faq, i) => (
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
    'loan-emi': {
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
    'topup-loan-emi': {
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
    'compare-loans': {
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
    'emi-comparison': {
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
    'advanced-home-loan': {
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
    'xirr-calculator': {
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
    'car-loan-emi': {
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
    },
    'sip-plus-lump': {
        title: "Hybrid Strategy: SIP + Lump Sum",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Why Combine Both?</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p>Combine the power of a one-time investment with disciplined monthly savings to accelerate your wealth creation.</p>
                </div>
            </div>
        )
    },
    'step-up-loan-emi': {
        title: "Step-Up Loan Repayment",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Pay Off Debt Faster</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p>Increasing your EMI annually in line with your income growth can drastically reduce your loan tenure and interest burden.</p>
                </div>
            </div>
        )
    },
    'moratorium-loan-emi': {
        title: "Moratorium Impact Analysis",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">The Cost of 'Skipping' EMIs</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p>Understanding how interest capitalizes during a moratorium period and increases your future liability.</p>
                </div>
            </div>
        )
    },
    'ultimate-fire-planner': {
        title: "Financial Independence & Retire Early (FIRE)",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Planning Your Freedom</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p>Calculate your 'FI Number' and determine when you can retire based on your savings rate and expenses.</p>
                </div>
            </div>
        )
    },
    'rent-vs-buy': {
        title: "Rent vs Buy Decision",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">The Mathematical Truth</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p>Compare the net worth impact of buying a home versus renting and investing the surplus.</p>
                </div>
            </div>
        )
    },
    'step-up-plus-lump': {
        title: "Advanced Wealth Builder",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Maximum Growth Strategy</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p>A comprehensive view of how Step-Up SIPs combined with an initial Lump Sum can compound over time.</p>
                </div>
            </div>
        )
    },
    'swr-simulator': {
        title: "Safe Withdrawal Rate Simulator",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Will Your Money Last?</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p>Simulate different withdrawal rates (e.g., 4% Rule) to see how long your retirement corpus will survive market volatility.</p>
                </div>
            </div>
        )
    },
    'cost-of-delay': {
        title: "The Price of Procrastination",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Start Early, Win Big</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p>See exactly how much money you lose by delaying your investment journey by even a few years.</p>
                </div>
            </div>
        )
    },
    'step-down-withdrawal': {
        title: "Step-Down Withdrawal Planning",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Variable Retirement Expenses</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p>Model higher expenses in early retirement years (travel, hobbies) reducing to lower stable expenses later.</p>
                </div>
            </div>
        )
    },
    'inflation-impact': {
        title: "Inflation: The Silent Killer",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Purchasing Power Erosion</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p>Visualize how inflation eats into the value of your savings over time, necessitating higher returns.</p>
                </div>
            </div>
        )
    },
    'asset-allocation': {
        title: "Portfolio Rebalancing",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Stay on Target</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p>Calculate buy/sell amounts to restore your portfolio to its ideal Equity:Debt ratio.</p>
                </div>
            </div>
        )
    },
    'credit-card-payoff': {
        title: "Debt Freedom Planner",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Escape the Debt Trap</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p>See how increasing your monthly payment can save you thousands in interest and get you debt-free months sooner.</p>
                </div>
            </div>
        )
    },
    'roi-calculator': {
        title: "Return on Investment",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Measure Your Success</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p>Simple tools to calculate the percentage return and annualized yield of any investment.</p>
                </div>
            </div>
        )
    },
    'refinance-calculator': {
        title: "Loan Refinance Analysis",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Should You Switch?</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p>Calculate the break-even point and total savings when switching your loan to a lower interest rate.</p>
                </div>
            </div>
        )
    },
    'home-loan-eligibility': {
        title: "How Much Can You Borrow?",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Eligibility Calculator</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p>Estimate your home loan eligibility based on your income, existing debts, and bank FOIR norms.</p>
                </div>
            </div>
        )
    },
    'property-loan-eligibility': {
        title: "Property-Linked Eligibility",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">LTV & Income Analysis</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p>Determine the maximum loan based on property value limits (LTV) and your repayment capacity.</p>
                </div>
            </div>
        )
    },
    'expense-ratio-calculator': {
        title: "True Cost of Fees",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Impact of Expense Ratios</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p>See how a 1-2% difference in mutual fund expense ratios can cost you lakhs over a long-term investment horizon.</p>
                </div>
            </div>
        )
    },
    'advanced-car-loan-emi': {
        title: "Complete Car Financing",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Total Cost of Ownership</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p>Factor in down payments, trade-ins, fees, and taxes to see the real cost of buying your car.</p>
                </div>
            </div>
        )
    },
    'gst-calculator': {
        title: "Goods and Services Tax (GST) Explained",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Understanding GST Calculation</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        The Goods and Services Tax (GST) is an indirect tax that has replaced many indirect taxes in India. It is calculated on the value of the goods or services supplied.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <h4 className="font-bold text-indigo-800 mb-2">Exclusive GST</h4>
                            <p className="text-sm text-indigo-700">
                                This is when GST is <strong>added</strong> to the product price.
                                <br />Result = Cost + (Cost × Rate%)
                            </p>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <h4 className="font-bold text-emerald-800 mb-2">Inclusive GST</h4>
                            <p className="text-sm text-emerald-700">
                                This is when the price <strong>already includes</strong> GST.
                                <br />Original Cost = MRP / (1 + Rate%)
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    'nps-calculator': {
        title: "Planning Your Retirement with NPS",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Why Invest in NPS?</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        The <strong>National Pension System (NPS)</strong> is a government-sponsored pension scheme. It is cost-effective and tax-efficient, designed to encourage systematic saving during your subscriber's earning life.
                    </p>
                    <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 my-4">
                        <h4 className="font-bold text-orange-900 mb-2">NPS Maturity Rules</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-orange-800">
                            <li>At age 60, you can withdraw up to <strong>60%</strong> of the corpus as a tax-free lump sum.</li>
                            <li>The remaining <strong>40%</strong> (at minimum) must be used to purchase an Annuity plan that provides a monthly pension.</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    'ssy-calculator': {
        title: "Sukanya Samriddhi Yojana (SSY) Guide",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">About the Scheme</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        <strong>Sukanya Samriddhi Yojana</strong> is a small deposit scheme by the Government of India meant exclusively for a girl child. It currently offers one of the highest interest rates among all small savings schemes.
                    </p>
                    <div className="bg-pink-50 p-4 rounded-xl border border-pink-100 my-4">
                        <h4 className="font-bold text-pink-900 mb-2">Key Features</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-pink-800">
                            <li><strong>Lock-in:</strong> Maturity is 21 years from the date of opening.</li>
                            <li><strong>Deposits:</strong> You only need to deposit for the first 15 years.</li>
                            <li><strong>Tax Benefits:</strong> EEE Status (Exempt-Exempt-Exempt). Investment, Interest, and Maturity are all tax-free.</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    '401k-calculator': {
        title: "401(k) Retirement Planner",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Maximize Your 401(k)</h3>
                <div className="prose prose-blue max-w-none text-gray-600">
                    <p className="mb-4">
                        A <strong>401(k)</strong> is a feature of a qualified profit-sharing plan that allows employees to contribute a portion of their wages to individual accounts.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 my-4">
                        <h4 className="font-bold text-blue-900 mb-2">Employer Match</h4>
                        <p className="text-sm text-blue-800">
                            Many employers match a portion of your contributions. This is essentially <strong>free money</strong>. Common match is 50% of your contribution up to 6% of your salary.
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    'roth-ira-calculator': {
        title: "Roth IRA Growth Calculator",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Tax-Free Retirement Income</h3>
                <div className="prose prose-purple max-w-none text-gray-600">
                    <p className="mb-4">
                        A <strong>Roth IRA</strong> allows you to contribute after-tax dollars. The biggest benefit is that your money grows tax-free, and you can withdraw it tax-free in retirement.
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                        <li><strong>2024 Limit:</strong> $7,000 ($8,000 if age 50+).</li>
                        <li><strong>Flexibility:</strong> You can withdraw your <em>contributions</em> (not earnings) at any time without penalty.</li>
                    </ul>
                </div>
            </div>
        )
    },
    '529-college-savings': {
        title: "529 Education Savings Plan",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Saving for College</h3>
                <div className="prose prose-sky max-w-none text-gray-600">
                    <p className="mb-4">
                        A <strong>529 Plan</strong> is a tax-advantaged savings plan designed to encourage saving for future education costs.
                    </p>
                    <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 my-4">
                        <h4 className="font-bold text-sky-900 mb-2">Key Benefits</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm text-sky-800">
                            <li><strong>Tax-Free Growth:</strong> Earnings are not subject to federal tax.</li>
                            <li><strong>Tax-Free Withdrawals:</strong> No tax when used for qualified education expenses (tuition, books, room & board).</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    'us-mortgage-calculator': {
        title: "Understanding Your US Mortgage",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">More Than Just Principal & Interest</h3>
                <div className="prose prose-blue max-w-none text-gray-600">
                    <p className="mb-4">
                        In the US, your monthly housing payment is often referred to as <strong>PITI</strong> (Principal, Interest, Taxes, and Insurance). Understanding these components is crucial for budgeting.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <h4 className="font-bold text-indigo-900 mb-2">The Core Payment</h4>
                            <p className="text-sm text-indigo-800">
                                <strong>Principal & Interest:</strong> This is the loan repayment. In the early years of a 30-year fixed loan, nearly 80-90% of this amount goes toward interest, not paying down debt.
                            </p>
                        </div>
                        <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                            <h4 className="font-bold text-sky-900 mb-2">The "Escrow" Items</h4>
                            <p className="text-sm text-sky-800">
                                <strong>Taxes & Insurance:</strong> Most lenders collect 1/12th of your annual Property Tax and Homeowners Insurance bill every month and hold it in an Escrow Account to pay the bills for you.
                            </p>
                        </div>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-4">
                        <h4 className="font-bold text-amber-900 mb-2">What is PMI?</h4>
                        <p className="text-sm text-amber-800">
                            <strong>Private Mortgage Insurance (PMI)</strong> is usually required if your down payment is less than 20%. It protects the lender (not you) if you default. It typically costs 0.5% to 1% of the loan amount annually and can be removed once you build enough equity (usually 20%).
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    'rmd-calculator': {
        title: "Navigating Required Minimum Distributions (RMDs)",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">The "Use It or Lose It" Rule</h3>
                <div className="prose prose-blue max-w-none text-gray-600">
                    <p className="mb-4">
                        The IRS allows your retirement savings (Traditional IRA, 401k) to grow tax-deferred for decades. However, the government eventually wants its tax revenue. Starting at <strong>age 73</strong>, you are legally required to withdraw a specific minimum amount every year.
                    </p>

                    <div className="bg-red-50 p-4 rounded-xl border border-red-100 my-6">
                        <h4 className="font-bold text-red-900 mb-2">⚠️ The Heavy Penalty</h4>
                        <p className="text-sm text-red-800">
                            If you fail to take your full RMD by the deadline (usually Dec 31), the IRS imposes a penalty (excise tax) of up to <strong>25%</strong> of the amount not withdrawn. This is one of the steepest penalties in the tax code!
                        </p>
                    </div>

                    <h4 className="font-bold text-gray-800 mb-2">How is it Calculated?</h4>
                    <p className="mb-4">
                        Your RMD is calculated by dividing your account balance (as of Dec 31 of the prior year) by a <strong>Life Expectancy Factor</strong> from the IRS Uniform Lifetime Table. As you get older, this factor decreases, forcing you to withdraw a larger percentage of your portfolio.
                    </p>
                </div>
            </div>
        )
    },
    'us-capital-gains': {
        title: "Capital Gains Tax Guide",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Holding Period Matters</h3>
                <div className="prose prose-blue max-w-none text-gray-600">
                    <p className="mb-4">
                        The US tax code rewards long-term investors. The tax rate you pay on asset profits depends heavily on how long you owned the asset.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                        <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                            <h4 className="font-bold text-gray-800 mb-2">Short Term (&lt; 1 Year)</h4>
                            <p className="text-sm text-gray-700">
                                Profits are taxed as <strong>Ordinary Income</strong>. This means they are added to your wages and taxed at your marginal tax bracket (which can be as high as 37%).
                            </p>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <h4 className="font-bold text-emerald-900 mb-2">Long Term (&gt; 1 Year)</h4>
                            <p className="text-sm text-emerald-800">
                                Profits enjoy preferential tax rates: <strong>0%, 15%, or 20%</strong>, depending on your taxable income. This is significantly lower than ordinary income rates for most investors.
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                        <h4 className="font-bold text-blue-900 mb-2">Net Investment Income Tax (NIIT)</h4>
                        <p className="text-sm text-blue-800">
                            High earners (Modified Adjusted Gross Income over $200k for single, $250k for married) may owe an additional <strong>3.8% surcharge</strong> on top of capital gains tax.
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    'social-security-break-even': {
        title: "Social Security Claiming Strategy",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">When Should You Claim?</h3>
                <div className="prose prose-blue max-w-none text-gray-600">
                    <p className="mb-4">
                        Deciding when to start collecting Social Security benefits is one of the most important retirement decisions you'll make. You can start as early as age 62, or wait until age 70.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                        <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                            <h4 className="font-bold text-orange-900 mb-2">Age 62 (Early)</h4>
                            <p className="text-sm text-orange-800">
                                You get checks sooner, but they are <strong>permanently reduced</strong> (up to 30% less than your full benefit).
                            </p>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                            <h4 className="font-bold text-emerald-900 mb-2">Full Retirement Age</h4>
                            <p className="text-sm text-emerald-800">
                                Usually 66 or 67. You get your standard "Primary Insurance Amount" (PIA).
                            </p>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <h4 className="font-bold text-indigo-900 mb-2">Age 70 (Delayed)</h4>
                            <p className="text-sm text-indigo-800">
                                You get a <strong>permanently increased</strong> benefit (8% increase per year of delay).
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-4">
                        <h4 className="font-bold text-gray-900 mb-2">The Break-Even Concept</h4>
                        <p className="text-sm text-gray-800">
                            If you claim at 62, you receive more checks but smaller amounts. If you wait until 70, you receive fewer checks but much larger ones. The <strong>Break-Even Age</strong> is the point where the total lifetime payout of waiting catches up to the early claiming strategy. Usually, this is around age 80-82. If you expect to live longer than this, waiting usually pays off.
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    'us-paycheck-calculator': {
        title: "Understanding Your Take-Home Pay",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Where Does the Money Go?</h3>
                <div className="prose prose-blue max-w-none text-gray-600">
                    <p className="mb-4">
                        Your <strong>Gross Pay</strong> is your salary before any deductions. Your <strong>Net Pay</strong> is what actually hits your bank account. The difference is taxes and other deductions.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                        <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                            <h4 className="font-bold text-rose-900 mb-2">FICA Taxes</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-rose-800">
                                <li><strong>Social Security:</strong> 6.2% of your income (up to a limit). This funds retirement benefits for current retirees.</li>
                                <li><strong>Medicare:</strong> 1.45% of your income (unlimited). This funds healthcare for seniors.</li>
                            </ul>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <h4 className="font-bold text-indigo-900 mb-2">Income Taxes</h4>
                            <ul className="list-disc pl-5 space-y-1 text-sm text-indigo-800">
                                <li><strong>Federal Tax:</strong> Progressive rates from 10% to 37% based on your filing status.</li>
                                <li><strong>State Tax:</strong> Varies by state. Some (like TX, FL, WA) have 0%, while others (like CA, NY) have high rates.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-4">
                        <h4 className="font-bold text-gray-900 mb-2">Pay Frequency Impact</h4>
                        <p className="text-sm text-gray-800">
                            While your total annual tax is the same, your paycheck size depends on frequency.
                            <br />- <strong>Bi-Weekly (26 paychecks):</strong> You get paid every 2 weeks. This means 2 months a year you get 3 paychecks ("magic months").
                            <br />- <strong>Semi-Monthly (24 paychecks):</strong> You get paid twice a month (e.g., 15th and 30th). Every paycheck is the same size.
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    'hsa-calculator': {
        title: "The Power of a Health Savings Account (HSA)",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Why the HSA is the Ultimate Savings Tool</h3>
                <div className="prose prose-emerald max-w-none text-gray-600">
                    <p className="mb-4">
                        An <strong>HSA</strong> is more than just a medical fund; it's a powerful investment vehicle. It offers a "Triple Tax Advantage" that no other account (including 401ks and IRAs) can match.
                    </p>

                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 my-8">
                        <h4 className="text-lg font-bold text-emerald-900 mb-3 text-center">The Triple Tax Advantage</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="font-bold text-emerald-800">Tax-Deductible</p>
                                <p className="text-xs text-emerald-700">Contributions reduce your taxable income.</p>
                            </div>
                            <div>
                                <p className="font-bold text-emerald-800">Tax-Free Growth</p>
                                <p className="text-xs text-emerald-700">Investment gains are not taxed.</p>
                            </div>
                            <div>
                                <p className="font-bold text-emerald-800">Tax-Free Use</p>
                                <p className="text-xs text-emerald-700">Withdrawals for medical costs are 100% tax-free.</p>
                            </div>
                        </div>
                    </div>

                    <h4 className="font-bold text-gray-800 mb-2">The Hidden Retirement Strategy</h4>
                    <p className="mb-4">
                        Many savvy investors use the HSA as a <strong>secondary retirement account</strong>. If you pay for current medical expenses out-of-pocket and leave your HSA money invested, it can grow into a massive tax-free nest egg. After age 65, you can withdraw money for <em>any</em> reason (taxed as ordinary income, like a Traditional IRA), but withdrawals for medical costs remain tax-free forever.
                    </p>
                </div>
            </div>
        )
    },
    'hourly-to-salary': {
        title: "Converting Hourly Wages to Salary",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Mastering Your Income Math</h3>
                <div className="prose prose-indigo max-w-none text-gray-600">
                    <p className="mb-4">
                        Understanding how your hourly rate translates to an annual salary is crucial for budgeting, loan applications, and job offer comparisons.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <h4 className="font-bold text-indigo-900 mb-2">The "2,000 Hour" Rule</h4>
                            <p className="text-sm text-indigo-800">
                                A quick "back of the envelope" calculation is to multiply your hourly rate by 2,000 (40 hours/week × 50 weeks). For example, $25/hr ≈ $50,000/year.
                            </p>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                            <h4 className="font-bold text-gray-800 mb-2">Full Precision</h4>
                            <p className="text-sm text-gray-700">
                                A standard full-time year actually has 2,080 working hours (40 hours × 52 weeks). Our calculator uses the 52-week standard for maximum accuracy.
                            </p>
                        </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 mb-4">
                        <h4 className="font-bold text-amber-900 mb-2">Paid vs. Unpaid Time Off</h4>
                        <p className="text-sm text-amber-800">
                            Consider whether your position includes paid vacation. If you take 2 weeks of unpaid vacation, your "Weeks per Year" should be 50 instead of 52, which will reduce your effective annual salary.
                        </p>
                    </div>
                </div>
            </div>
        )
    },
    'student-loan-payoff': {
        title: "Accelerating Your Student Loan Payoff",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Strategic Debt Repayment</h3>
                <div className="prose prose-blue max-w-none text-gray-600">
                    <p className="mb-4">
                        Tackling student debt requires a clear plan. Our calculator helps you compare standard and extended repayment timelines while showing the massive impact of even small extra payments.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 my-4 text-sm text-blue-800">
                        <strong>💡 Pro Tip:</strong> Paying $100 extra each month on a $30k loan can save you thousands in interest and shave years off your debt freedom date.
                    </div>
                </div>
            </div>
        )
    },
    'student-loan-forgiveness': {
        title: "Navigating Student Loan Forgiveness",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">PSLF and IDR Strategies</h3>
                <div className="prose prose-emerald max-w-none text-gray-600">
                    <p className="mb-4">
                        Public Service Loan Forgiveness (PSLF) and Income-Driven Repayment (IDR) plans offer paths to debt relief after a certain period of service or payments.
                    </p>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 my-4 text-sm text-emerald-800">
                        <strong>⚠️ Important:</strong> Be aware of the 'Tax Bomb' for long-term IDR forgiveness (20-25 years), as the forgiven amount may be treated as taxable income.
                    </div>
                </div>
            </div>
        )
    },
    'medicare-cost-estimator': {
        title: "Planning for Medicare Costs",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Medicare Premiums and IRMAA</h3>
                <div className="prose prose-blue max-w-none text-gray-600">
                    <p className="mb-4">
                        Medicare isn't free. Between Part B premiums, Part D drug plans, and Medigap supplements, costs can add up. High earners must also factor in IRMAA surcharges.
                    </p>
                </div>
            </div>
        )
    },
    'aca-marketplace-calculator': {
        title: "ACA Subsidy and Premium Estimator",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Understanding Health Insurance Subsidies</h3>
                <div className="prose prose-indigo max-w-none text-gray-600">
                    <p className="mb-4">
                        The Affordable Care Act (ACA) provides tax credits to help lower monthly premiums in the Marketplace. Your eligibility depends on household size and estimated annual income.
                    </p>
                </div>
            </div>
        )
    },
    'child-tax-credit': {
        title: "Maximizing Child Tax Credits",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Family Tax Benefits</h3>
                <div className="prose prose-rose max-w-none text-gray-600">
                    <p className="mb-4">
                        The Child Tax Credit (CTC) provides significant relief for families. Our calculator handles current IRS rules, including phase-out limits for higher earners and the refundable portion.
                    </p>
                </div>
            </div>
        )
    },
    'fsa-calculator': {
        title: "Optimizing Your FSA",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Tax Savings with Flexible Spending Accounts</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        Flexible Spending Accounts (FSAs) allow you to pay for healthcare and dependent care with pre-tax dollars. However, the 'use-it-or-lose-it' rule makes accurate planning essential.
                    </p>
                </div>
            </div>
        )
    },
    'traditional-ira-calculator': {
        title: "Traditional IRA Growth and Taxes",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Planning for Retirement with a Traditional IRA</h3>
                <div className="prose prose-amber max-w-none text-gray-600">
                    <p className="mb-4">
                        Traditional IRAs offer tax-deferred growth and potential immediate tax deductions. This calculator helps you project your balance and estimate future Required Minimum Distributions (RMDs).
                    </p>
                </div>
            </div>
        )
    },
    'home-affordability-calculator': {
        title: "How Much House Can You Afford?",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Navigating the Path to Homeownership</h3>
                <div className="prose prose-blue max-w-none text-gray-600">
                    <p className="mb-4">
                        Buying a home is the largest purchase most people make. Using the 28/36 debt-to-income rule, we help you find a sustainable price point that fits your budget.
                    </p>
                </div>
            </div>
        )
    },
    'auto-lease-vs-buy': {
        title: "Auto Lease vs. Buy Comparison",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Choosing Your Next Vehicle Path</h3>
                <div className="prose prose-gray max-w-none text-gray-600">
                    <p className="mb-4">
                        Should you lease or buy your next car? Leasing offers lower monthly payments, but buying builds equity. Our calculator compares the total cost of ownership over the long term.
                    </p>
                </div>
            </div>
        )
    },
    'property-tax-estimator': {
        title: "Estimating Property Taxes",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Understanding Real Estate Tax Obligations</h3>
                <div className="prose prose-indigo max-w-none text-gray-600">
                    <p className="mb-4">
                        Property taxes vary wildly by state and local jurisdiction. This tool estimates your annual bill based on home value and provides insights into SALT deduction limits.
                    </p>
                </div>
            </div>
        )
    },
    'debt-avalanche-snowball': {
        title: "Avalanche vs. Snowball Debt Payoff",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Choosing the Best Strategy to Become Debt-Free</h3>
                <div className="prose prose-purple max-w-none text-gray-600">
                    <p className="mb-4">
                        Whether you prefer the mathematical efficiency of the Avalanche method or the psychological momentum of the Snowball method, the key is having a consistent plan to eliminate debts.
                    </p>
                </div>
            </div>
        )
    },
    'fico-score-impact': {
        title: "FICO Credit Score Simulator",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Simulating Your Credit Future</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        Your credit score impacts everything from mortgage rates to insurance premiums. See how paying down debt or opening new credit accounts might influence your score over time.
                    </p>
                </div>
            </div>
        )
    },
    'uk-income-tax': {
        title: "UK Income Tax Guide",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Understanding UK Personal Taxation</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        The UK tax system is based on an annual "Personal Allowance" and progressive tax bands. For the 2024/25 tax year, most individuals receive a standard allowance of £12,570 before paying any Income Tax.
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Key Components:</h4>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li><strong>Income Tax:</strong> 20% (Basic), 40% (Higher), and 45% (Additional) rates.</li>
                        <li><strong>National Insurance (NI):</strong> Mandatory contributions that qualify you for certain benefits and the State Pension. The main rate was reduced to 8% in April 2024.</li>
                        <li><strong>Pension Contributions:</strong> Often deducted via "Salary Sacrifice" or "Net Pay" arrangements, reducing your taxable income.</li>
                        <li><strong>Personal Allowance Taper:</strong> For every £2 earned above £100,000, you lose £1 of your personal allowance.</li>
                    </ul>
                </div>
            </div>
        )
    },
    'australia-income-tax': {
        title: "Australia Tax & Stage 3 Cuts",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Your Net Pay in Australia</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        From July 1, 2024, Australia implemented significant "Stage 3" tax cuts, lowering rates for most taxpayers to provide cost-of-living relief.
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Important Concepts:</h4>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li><strong>Medicare Levy:</strong> Usually 2% of your taxable income, funding the public health system.</li>
                        <li><strong>Superannuation Guarantee (SG):</strong> Currently 11.5% for 2024/25, paid by your employer on top of your base salary (unless your package is 'inclusive').</li>
                        <li><strong>Tax-Free Threshold:</strong> The first $18,200 you earn is tax-free for residents.</li>
                    </ul>
                </div>
            </div>
        )
    },
    'canada-income-tax': {
        title: "Canada Income Tax Breakdown",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Federal and Provincial Taxes</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        In Canada, you pay both Federal income tax and Provincial/Territorial income tax. Most provinces (except Quebec) have their taxes collected by the federal government.
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Deductions and Credits:</h4>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li><strong>RRSP Contributions:</strong> Investing in a Registered Retirement Savings Plan reduces your taxable income for the year.</li>
                        <li><strong>CPP & EI:</strong> Canada Pension Plan and Employment Insurance are mandatory payroll deductions up to an annual maximum.</li>
                        <li><strong>Basic Personal Amount:</strong> A non-refundable tax credit that everyone can claim to reduce their federal tax.</li>
                    </ul>
                </div>
            </div>
        )
    },
    'europe-vat': {
        title: "How VAT Works in Europe",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Value Added Tax (VAT)</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        VAT is a consumption tax placed on a product whenever value is added at each stage of the supply chain, from production to the point of sale.
                    </p>
                    <p className="mb-4">
                        In the European Union, member states are required to have a standard VAT rate of at least 15%, but most choose rates around 19-25%. Many countries also offer "Reduced Rates" for essentials like food, books, or medicine.
                    </p>
                </div>
            </div>
        )
    },
    'japan-paycheck': {
        title: "Japan Salary and Social Insurance",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Living and Working in Japan</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        Japan's payroll system includes deductions for Social Insurance (Shakai Hoken) and several layers of taxes.
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Primary Deductions:</h4>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li><strong>Social Insurance:</strong> Includes Health Insurance, Employees' Pension, and Employment Insurance.</li>
                        <li><strong>Income Tax (Shotoku-zei):</strong> A progressive national tax on your annual income.</li>
                        <li><strong>Resident Tax (Jumin-zei):</strong> A local tax (usually ~10%) based on your income from the previous year.</li>
                        <li><strong>Deductions:</strong> Japan offers an "Employment Income Deduction" which acts like a standard deduction based on your salary level.</li>
                    </ul>
                </div>
            </div>
        )
    },
    'hongkong-salary-tax': {
        title: "Hong Kong Salaries Tax Guide",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">HK's Low-Tax Advantage</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        Hong Kong is known for its simple and low tax system. Tax is charged on your "Net Chargeable Income" using either progressive rates or a flat standard rate, whichever is lower.
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Highlights:</h4>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li><strong>MPF:</strong> Mandatory Provident Fund contributions (usually 5% capped at HK$1,500/month).</li>
                        <li><strong>Allowances:</strong> Generous basic allowances for individuals and married couples significantly reduce the tax burden.</li>
                        <li><strong>Tax Reductions:</strong> The government often provides one-off tax reductions in the annual budget.</li>
                    </ul>
                </div>
            </div>
        )
    },
    'china-income-tax': {
        title: "Understanding China IIT",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Individual Income Tax (IIT)</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        China uses a progressive tax system for comprehensive income (wages, salaries, etc.).
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Calculation Flow:</h4>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li><strong>Standard Deduction:</strong> 5,000 RMB per month (60,000 RMB per year).</li>
                        <li><strong>Special Additional Deductions:</strong> Expenses like children's education, rent, or elderly care can be deducted (not modeled in this simplified calculator).</li>
                        <li><strong>Social Insurance:</strong> Employee contributions to pension, medical, and unemployment insurance are tax-deductible.</li>
                    </ul>
                </div>
            </div>
        )
    },
    'switzerland-income-tax': {
        title: "Switzerland's Three-Tier Tax System",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Federal, Cantonal, and Communal Taxes</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        Swiss taxes are decentralized. You pay a small percentage to the Federal government, but the bulk of your income tax goes to your Canton and your Local Commune (Municipality).
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Key Deductions:</h4>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li><strong>Social Security (1st Pillar):</strong> AHV/IV/EO contributions are mandatory and deducted directly from your salary.</li>
                        <li><strong>Pension Fund (2nd Pillar):</strong> BVG contributions vary by employer and age.</li>
                        <li><strong>Canton Choice:</strong> Where you live matters—taxes in Canton Zug are famously much lower than in Zurich or Geneva.</li>
                    </ul>
                </div>
            </div>
        )
    },
    'singapore-tax': {
        title: "Singapore Personal Income Tax & CPF",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Understanding CPF and Resident Tax</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        Singapore has one of the world's most business-friendly tax systems, featuring low progressive rates and generous relief schemes.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>CPF Contributions:</strong> Mandatory for Singapore Citizens and PRs. Employee contribution is typically 20% (up to a salary ceiling).</li>
                        <li><strong>Progressive Brackets:</strong> Tax rates start at 0% and go up to 24% for very high earners (YA 2024).</li>
                        <li><strong>Tax Reliefs:</strong> Citizens enjoy reliefs for Earned Income, CPF, dependents, and SRS contributions.</li>
                    </ul>
                </div>
            </div>
        )
    },
    'uae-gratuity': {
        title: "UAE End of Service Gratuity",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">How Gratuity is Calculated in the UAE</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        Under the UAE Labor Law 2022, employees are entitled to a "gratuity" payment when their employment contract ends, provided they have completed at least one year of service.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Service Period:</strong> Calculated on a pro-rata basis for partial years after the first year.</li>
                        <li><strong>First 5 Years:</strong> 21 days' basic salary for each year of service.</li>
                        <li><strong>After 5 Years:</strong> 30 days' basic salary for each year of service beyond the first five.</li>
                        <li><strong>Basic Salary:</strong> Calculation is based only on the basic salary, excluding allowances like housing or transport.</li>
                    </ul>
                </div>
            </div>
        )
    },
    'nz-paycheck': {
        title: "New Zealand's PAYE System",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Income Tax, ACC, and KiwiSaver</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        New Zealand uses the PAYE (Pay As You Earn) system to collect income tax and ACC earner levies directly from your salary.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Income Tax Brackets:</strong> Progressive rates ranging from 10.5% to 39%.</li>
                        <li><strong>ACC Levy:</strong> A fixed percentage (approx 1.6%) that covers you for accidental injuries.</li>
                        <li><strong>KiwiSaver:</strong> Optional retirement scheme with standard employee contribution rates of 3%, 4%, 6%, 8%, or 10%.</li>
                    </ul>
                </div>
            </div>
        )
    },
    'india-tax': {
        title: "India Income Tax: New vs. Old Regime",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Which Tax Regime is Right for You?</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        From FY 2024-25, the New Tax Regime is the default. It offers lower rates but few exemptions. The Old Regime allows for various deductions like 80C, 80D, and HRA.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Standard Deduction:</strong> Increased to ₹75,000 for New Regime and ₹50,000 for Old Regime.</li>
                        <li><strong>Rebate Section 87A:</strong> Tax-free income up to ₹7 Lakhs in the New Regime.</li>
                        <li><strong>Old Regime Exemptions:</strong> Useful if you have high HRA, home loan interest, and maximum 80C investments.</li>
                    </ul>
                </div>
            </div>
        )
    },
    'ireland-tax': {
        title: "Ireland PAYE, USC, and PRSI",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Summary of Irish Payroll Taxes</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        Ireland has weight-based income tax tiers, along with Universal Social Charge (USC) and social insurance (PRSI).
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>PAYE Rates:</strong> 20% on income up to the cutoff, 40% on balance.</li>
                        <li><strong>Tax Credits:</strong> Reduce the amount of PAYE you owe (e.g., Personal Tax Credit, Employee Tax Credit).</li>
                        <li><strong>USC:</strong> A tax that applies to your total gross income with its own progressive brackets.</li>
                        <li><strong>PRSI:</strong> Mandatory social insurance (typically 4% for Class A employees).</li>
                    </ul>
                </div>
            </div>
        )
    },
    'mexico-isr': {
        title: "Mexico's Income Tax (ISR) & IMSS",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Understanding Impuesto sobre la Renta</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        In Mexico, employers are responsible for withholding monthly income tax (ISR) and social security contributions (IMSS).
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>ISR Brackets:</strong> Progressive monthly rates starting from 1.92% to 35%.</li>
                        <li><strong>IMSS:</strong> Social security contribution that covers healthcare and pension.</li>
                        <li><strong>Annual Bonus (Aguinaldo):</strong> Mandatory year-end bonus (typically 15 days of salary).</li>
                    </ul>
                </div>
            </div>
        )
    },
    'brazil-clt': {
        title: "Brazil CLT Paycheck (Salário Líquido)",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">INSS, IRRF, and FGTS</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        The CLT system in Brazil provides many protections but involves complex progressive deductions for social security (INSS) and income tax (IRRF).
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>INSS:</strong> Progressive contribution capped at the maximum benefit limit.</li>
                        <li><strong>IRRF:</strong> Income tax deducted at source with specific monthly progressive tables.</li>
                        <li><strong>Dependents:</strong> Fixed deduction from the tax base per dependent.</li>
                        <li><strong>FGTS:</strong> 8% contribution paid by the employer to your severance fund.</li>
                    </ul>
                </div>
            </div>
        )
    },
    'south-africa-tax': {
        title: "South Africa's SARS Income Tax",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Tax Rates, Rebates, and Medical Credits</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        South Africa uses a progressive tax system (PAYE) with significant primary rebates that reduce your tax liability.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Tax Threshold:</strong> Below a certain income level, no tax is payable due to the primary rebate.</li>
                        <li><strong>Medical Tax Credits:</strong> Direct tax reductions for medical scheme members and their dependents.</li>
                        <li><strong>UIF:</strong> 1% contribution to the Unemployment Insurance Fund, capped at a maximum monthly salary.</li>
                    </ul>
                </div>
            </div>
        )
    },
};
