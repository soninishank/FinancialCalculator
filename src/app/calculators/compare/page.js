import { Suspense } from 'react';
import CompareWorkspace from '../../../components/calculators/CompareWorkspace';

export const metadata = {
    title: 'Compare Financial Calculators | FinCalc',
    description: 'Shortlist and compare financial calculators side-by-side. Share compare links and export your comparison as CSV.',
    alternates: {
        canonical: 'https://www.hashmatic.in/calculators/compare',
    },
};

export default function ComparePage() {
    return (
        <Suspense fallback={<div className="max-w-7xl mx-auto px-6 py-8 text-gray-500">Loading compare workspace...</div>}>
            <CompareWorkspace />
        </Suspense>
    );
}
