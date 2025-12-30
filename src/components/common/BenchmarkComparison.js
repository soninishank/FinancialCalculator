import React from 'react';

export default function BenchmarkComparison({ userReturn, userLabel = "Your Return" }) {
    const userPercent = userReturn * 100;

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
            <h4 className="text-sm font-bold text-gray-800 mb-2">📊 Benchmark Comparison</h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                <div className="bg-white p-2 rounded shadow-sm">
                    <div className="text-gray-500 font-medium">Bank FD</div>
                    <div className="font-bold text-gray-700">~6.5%</div>
                </div>
                <div className="bg-white p-2 rounded shadow-sm">
                    <div className="text-gray-500 font-medium">Inflation</div>
                    <div className="font-bold text-gray-700">~5.5%</div>
                </div>
                <div className="bg-white p-2 rounded shadow-sm">
                    <div className="text-gray-500 font-medium">Nifty 50</div>
                    <div className="font-bold text-gray-700">~12%</div>
                </div>
                <div className="bg-white p-2 rounded shadow-sm border border-teal-200">
                    <div className="text-teal-700 font-medium">{userLabel}</div>
                    <div className="font-bold text-teal-700">{userPercent.toFixed(2)}%</div>
                </div>
            </div>
        </div>
    );
}
