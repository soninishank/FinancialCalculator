import React from 'react';

const getRateMetadata = (rate) => {
    if (rate <= 0) return { label: 'No Growth', color: 'gray', description: 'Your money will not grow.' };
    if (rate <= 6) return { label: 'Low / Conservative', color: 'blue', description: 'Typical for Savings Accounts or Liquid Funds.' };
    if (rate <= 9) return { label: 'Moderate / Debt', color: 'indigo', description: 'Similar to Fixed Deposits or Debt Mutual Funds.' };
    if (rate <= 13) return { label: 'Balanced / Index', color: 'teal', description: 'Typical long-term average for Large Cap / Index Funds.' };
    if (rate <= 18) return { label: 'Aggressive / Growth', color: 'emerald', description: 'Aggressive growth, often seen in Mid-caps or Small-caps.' };
    if (rate <= 25) return { label: 'High Risk / Speculative', color: 'orange', description: 'Very high returns, difficult to sustain over long periods.' };
    return { label: 'Highly Unrealistic', color: 'rose', description: 'Historically, sustained returns above 25% are extremely rare and speculative.', isWarning: true };
};

export default function RateQualityGuard({ rate }) {
    const { label, color, description, isWarning } = getRateMetadata(rate);

    const colorMap = {
        gray: 'bg-gray-50 text-gray-600 border-gray-200',
        blue: 'bg-blue-50 text-blue-600 border-blue-200',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
        teal: 'bg-teal-50 text-teal-600 border-teal-200',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        orange: 'bg-orange-50 text-orange-600 border-orange-200',
        rose: 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm',
    };

    return (
        <div className={`mt-3 p-3 rounded-xl border ${colorMap[color]} transition-all duration-300 animate-fade-in`}>
            <div className="flex items-center gap-2 mb-1">
                {isWarning && (
                    <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                )}
                <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-[11px] font-medium leading-relaxed opacity-90 italic">
                {description}
            </p>
        </div>
    );
}
