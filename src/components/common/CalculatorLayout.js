import React from 'react';

export default function CalculatorLayout({
    inputs,
    summary,
    charts,
    pieChart,
    table,
    details
}) {
    return (
        <div className="animate-fade-in">
            {/* INPUTS SECTION */}
            <div className="space-y-6 mt-8">
                {inputs}
            </div>

            {/* SUMMARY CARDS */}
            <div className="mt-10">
                {summary}
            </div>

            {/* MAIN CHART (Compounding Bar Chart) */}
            {charts}

            {/* RESULTS GRID (Pie Chart + Table - Stacked Vertically) */}
            <div className="flex flex-col gap-8 mt-12">
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
            </div>

            {/* DETAILS / EXPLANATION SECTION */}
            {details && (
                <div className="mt-12">
                    {details}
                </div>
            )}
        </div>
    );
}
