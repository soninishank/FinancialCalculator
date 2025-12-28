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
    compoundInterest: {
        title: "Understanding Compound Interest",
        render: () => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Understanding Compound Interest</h3>
                <div className="prose prose-teal max-w-none text-gray-600">
                    <p className="mb-4">
                        <strong>Compound Interest</strong> is the interest calculated on the initial principal, which also includes all of the accumulated interest from previous periods. It makes your money grow faster because you earn returns on your returns.
                    </p>

                    <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 my-4">
                        <p className="font-semibold text-teal-800 text-center text-lg">
                            A = P(1 + r/n)^(nt)
                        </p>
                        <p className="text-center text-sm text-teal-600 mt-2">
                            A = Final Amount, P = Principal, r = Rate, n = Frequency, t = Time
                        </p>
                    </div>

                    <h4 className="font-semibold text-gray-800 mb-2">Key Components:</h4>
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                        <li><strong>Principal (P):</strong> The initial amount you invest.</li>
                        <li><strong>Rate (r):</strong> The annual interest rate.</li>
                        <li><strong>Frequency (n):</strong> How often interest is added (Monthly, Quarterly, Yearbook). More frequent compounding leads to higher returns.</li>
                        <li><strong>Time (t):</strong> The duration of the investment. Time is the most powerful factor in compounding.</li>
                    </ul>

                    <p>
                        The "magic" of compounding allows even small contributions to grow into significant wealth over long periods.
                    </p>
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
    }
};
