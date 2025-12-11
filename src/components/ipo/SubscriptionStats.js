import React from 'react';

export default function SubscriptionStats({ data }) {
    if (!data || data.length === 0) return null;

    // Filter out rows that are just headers or empty, if any leaked
    // Sort logic: Total last, others by some order?
    // NSE order usually: QIB, FII..., NII..., RII..., Total
    // Database returns undefined order unless we sort.

    // Let's define important categories to highlight or order

    // Sort function
    // Allowed categories as per user request

    const validCats = ['QIB', 'NII', 'RII', 'Total', 'Cutoff'];

    const filteredData = data.filter(d => validCats.includes(d.category));

    // Sort: Total first (as header), then QIB, NII, RII, Cutoff
    const sortOrder = { 'Total': 0, 'QIB': 1, 'NII': 2, 'RII': 3, 'Cutoff': 4 };

    const sortedData = [...filteredData].sort((a, b) => {
        const orderA = sortOrder[a.category] !== undefined ? sortOrder[a.category] : 99;
        const orderB = sortOrder[b.category] !== undefined ? sortOrder[b.category] : 99;
        return orderA - orderB;
    });

    const totalRow = sortedData.find(d => d.category === 'Total');
    const categories = sortedData.filter(d => d.category !== 'Total');

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-pink-500 rounded-full"></span>
                Subscription Status
            </h3>

            {/* Total Highlight */}
            {totalRow && (
                <div className="mb-8 p-6 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl text-white shadow-lg">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Overall Subscription</p>
                            <div className="text-4xl font-bold flex items-baseline gap-2">
                                {Number(totalRow.subscription_ratio).toFixed(2)}x
                                <span className="text-sm font-normal text-gray-400">times</span>
                            </div>
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-gray-400 text-xs">Total Bids</p>
                            <p className="text-xl font-semibold">{new Intl.NumberFormat('en-IN').format(totalRow.shares_bid)}</p>
                            <p className="text-gray-500 text-xs mt-1">Shares Offered: {new Intl.NumberFormat('en-IN').format(totalRow.shares_offered)}</p>
                        </div>
                    </div>
                    {/* Progress Bar for Total */}
                    <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-400 to-blue-500"
                            style={{ width: `${Math.min(parseFloat(totalRow.subscription_ratio) * 10, 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Categories Grid */}
            <div className="space-y-4">
                {categories.map((cat, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="mb-2 sm:mb-0 max-w-full sm:max-w-[40%]">
                            <p className="font-semibold text-gray-900 text-sm">{cat.category}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {new Intl.NumberFormat('en-IN').format(cat.shares_bid)} bids / {new Intl.NumberFormat('en-IN').format(cat.shares_offered)} offered
                            </p>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="flex-1 sm:w-48 bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${parseFloat(cat.subscription_ratio) >= 1 ? 'bg-green-500' : 'bg-yellow-500'}`}
                                    style={{ width: `${Math.min(parseFloat(cat.subscription_ratio) * 10, 100)}%` }}
                                ></div>
                            </div>
                            <div className="w-16 text-right">
                                <span className={`font-bold ${parseFloat(cat.subscription_ratio) >= 1 ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {Number(cat.subscription_ratio).toFixed(2)}x
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
