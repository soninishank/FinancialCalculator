import { Suspense } from 'react';
import CalculatorsList from '../../pages/CalculatorsList';

export const metadata = {
    title: 'Free Financial Calculators (SIP, EMI, Loan) - Hashmatic',
    description: "Take control of your finances with Hashmatic's free, accurate online calculators. Instantly calculate SIP returns, Loan EMIs, and Retirement goals. Start planning your future today!",
    keywords: ['calculator list', 'financial tools', 'investment calculators'],
    alternates: {
        canonical: 'https://www.hashmatic.in/calculators',
    },
};

export default function Page() {
    return (
        <Suspense fallback={<div className="p-6 text-center text-gray-500">Loading calculators...</div>}>
            <CalculatorsList />
        </Suspense>
    );
}
