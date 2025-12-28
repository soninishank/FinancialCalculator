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
    }
};
