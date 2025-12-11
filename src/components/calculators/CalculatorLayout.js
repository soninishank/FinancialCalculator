import React from 'react';

export default function CalculatorLayout({
    inputs,
    summary,
    charts,
    pieChart,
    table
}) {
    return (
        <div className="animate-fade-in">
            {/* INPUTS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mt-8">
                {inputs}
            </div>

            {/* SUMMARY CARDS */}
            {summary}

            {/* MAIN CHART (Compounding Bar Chart) */}
            {charts}

            {/* RESULTS GRID (Pie Chart + Table) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12 items-start">
                <div className="lg:col-span-1">
                    {pieChart}
                </div>
                <div className="lg:col-span-2 h-full">
                    {table}
                </div>
            </div>
        </div>
    );
}
