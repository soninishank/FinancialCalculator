import React from 'react';

const SubscriptionStats = ({ data }) => {
    if (!data || data.length === 0) return null;

    // Filter out 'Total' to handle it separately or at the bottom
    const mainCategories = data.filter(item => item.category !== 'Total');
    const totalRow = data.find(item => item.category === 'Total');

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                Subscription Status
                <span className="text-xs font-normal text-gray-500 ml-2">(RHP-based Allocation)</span>
            </h2>

            <div className="overflow-x-auto rounded-xl border border-gray-50">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Category</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Reserved</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Bids</th>
                            <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Subscribed</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {mainCategories.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/30 transition-colors">
                                <td className="px-4 py-4">
                                    <span className="text-sm font-semibold text-gray-700">{row.category}</span>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="text-sm text-gray-600 font-medium">
                                        {parseInt(row.shares_offered).toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="text-sm text-gray-600">
                                        {parseInt(row.shares_bid).toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-bold ${parseFloat(row.subscription_ratio) >= 1 ? 'text-green-600' : 'text-blue-600'}`}>
                                            {parseFloat(row.subscription_ratio).toFixed(2)}x
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {totalRow && (
                            <tr className="bg-blue-50/30 font-bold">
                                <td className="px-4 py-4">
                                    <span className="text-sm text-blue-900">Overall Total</span>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="text-sm text-blue-900">
                                        {parseInt(totalRow.shares_offered).toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="text-sm text-blue-900">
                                        {parseInt(totalRow.shares_bid).toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="text-base font-black text-blue-600">
                                        {parseFloat(totalRow.subscription_ratio).toFixed(2)}x
                                    </span>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SubscriptionStats;
