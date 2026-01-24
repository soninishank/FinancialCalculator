import React, { useEffect } from 'react';
import { prefetchPDF } from '../../utils/export';

export default function CalculatorLayout({
    inputs,
    summary,
    charts,
    pieChart,
    table,
    details,
    inputLabel = "Configure Inputs",
    resultLabel = "Analysis & Results"
}) {
    useEffect(() => {
        // Prefetch PDF capability after initial load (idle time)
        const timer = setTimeout(() => {
            prefetchPDF();
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="animate-fade-in" role="main">
            {/* INPUTS SECTION */}
            <section className="space-y-6 mt-8" aria-labelledby="inputs-heading">
                <h2 id="inputs-heading" className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                    <span className="w-1 h-6 bg-teal-500 rounded-full" aria-hidden="true"></span>
                    {inputLabel}
                </h2>
                {inputs}
            </section>

            {/* SUMMARY CARDS */}
            <section className="mt-10" aria-label="Summary Results">
                {summary}
            </section>

            {/* MAIN CHART (Compounding Bar Chart) */}
            <section className="mt-8" aria-label="Visual Analytics">
                {charts}
            </section>

            {/* RESULTS GRID (Pie Chart + Table - Stacked Vertically) */}
            {(pieChart || table) && (
                <section className="flex flex-col gap-8 mt-12" aria-labelledby="results-heading">
                    <h2 id="results-heading" className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                        <span className="w-1 h-6 bg-indigo-500 rounded-full" aria-hidden="true"></span>
                        {resultLabel}
                    </h2>
                    {pieChart && (
                        <div className="w-full">
                            {pieChart}
                        </div>
                    )}
                    {table && (
                        <div className="w-full">
                            {table}
                        </div>
                    )}
                </section>
            )}

            {/* DETAILS / EXPLANATION SECTION */}
            {details && (
                <section className="mt-12" aria-labelledby="details-heading">
                    <h2 id="details-heading" className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                        <span className="w-1 h-6 bg-blue-500 rounded-full" aria-hidden="true"></span>
                        Deep Dive & FAQ
                    </h2>
                    {details}
                </section>
            )}
        </div>
    );
}
