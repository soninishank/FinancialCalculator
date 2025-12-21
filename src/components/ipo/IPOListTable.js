// src/components/ipo/IpoListTable.js
import React from 'react';
import { moneyFormat } from "../../utils/formatting";

// Helper function to render table headers
const HeaderCell = ({ label, align = 'left' }) => (
    <th className={`py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 text-${align}`}>
        {label}
    </th>
);

// Reusable Table Row Component
const Row = ({ ipo, status }) => {
    // Basic safety checks
    const name = ipo.name || "Unknown Company";

    // Conditional visibility
    const showPrice = status !== 'Closed';
    const showIssueSize = status !== 'Closed';
    const type = ipo.type || "Equity";
    const openDate = ipo.openDate || "TBA";
    const closeDate = ipo.closeDate || "TBA";
    const listingDate = ipo.listingDate || "-";
    const price = ipo.priceRange || ipo.issuePrice;

    // Formatting helpers
    const typeTheme = (type === 'SME' || type === 'SME IPO') ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800';

    // Format issue size using moneyFormat (compact=true for Cr/Lakhs)
    let issueSizeDisplay = "-";
    if (ipo.issueSize && ipo.issueSize !== '-') {
        issueSizeDisplay = moneyFormat(ipo.issueSize, 'INR', true);
    }

    // Logic for "Closing Today"
    const isClosingToday = React.useMemo(() => {
        if (!closeDate || closeDate === 'TBA') return false;
        const now = new Date();
        const close = new Date(closeDate);
        return (
            now.getDate() === close.getDate() &&
            now.getMonth() === close.getMonth() &&
            now.getFullYear() === close.getFullYear()
        );
    }, [closeDate]);

    // Conditional Styles
    const priceClass = status === 'Open' ? 'font-bold text-gray-900' : 'font-medium text-gray-800';


    return (
        <tr className={`hover:bg-gray-50 transition-colors ${isClosingToday ? 'bg-orange-50' : ''}`}>
            {/* Company & Type */}
            <td className="py-3 px-4 whitespace-nowrap cursor-pointer group" onClick={() => window.location.href = `/ipo/${ipo.symbol}`}>
                <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{name}</p>
                <div className="flex gap-2 mt-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeTheme}`}>
                        {type}
                    </span>
                    {isClosingToday && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 animate-pulse">
                            Ends Today
                        </span>
                    )}
                </div>
            </td>

            {/* Open Date */}
            <td className="py-3 px-4 text-xs text-gray-700 whitespace-nowrap">
                {openDate}
            </td>

            {/* Close Date */}
            <td className="py-3 px-4 text-xs text-gray-700 whitespace-nowrap">
                {closeDate}
            </td>

            {/* Listing Date */}
            <td className="py-3 px-4 text-xs text-gray-700 whitespace-nowrap">
                {listingDate}
            </td>

            {/* Issue Price - Conditional */}
            {showPrice && (
                <td className={`py-3 px-4 text-right tabular-nums whitespace-nowrap ${priceClass}`}>
                    {price ? (
                        <span>{price}</span>
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                </td>
            )}

            {/* Issue Size */}
            {showIssueSize && (
                <td className="py-3 px-4 text-right tabular-nums text-gray-600 whitespace-nowrap">
                    {issueSizeDisplay}
                </td>
            )}
        </tr>
    );
};

// Main Component
export default function IpoListTable({ data, status }) {
    const listData = data || [];
    const showPrice = status !== 'Closed';
    const showIssueSize = status !== 'Closed';

    return (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-xl border border-gray-100">
            {listData.length > 0 ? (
                <table className="min-w-full text-left text-sm divide-y divide-gray-100">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <HeaderCell label="Company/Type" />
                            <HeaderCell label="Open Date" />
                            <HeaderCell label="Close Date" />
                            <HeaderCell label="Listing Date" />
                            {showPrice && <HeaderCell label="Price Range" align="right" />}

                            {showIssueSize && <HeaderCell label="Issue Size" align="right" />}
                        </tr>
                    </thead>
                    <tbody>
                        {listData.map(ipo => (
                            <Row key={ipo.id} ipo={ipo} status={status} />
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="p-10 text-center">
                    <p className="text-lg font-medium text-gray-600">No {status} IPOs are currently available.</p>
                    <p className="text-sm text-gray-400 mt-1">Check back later.</p>
                </div>
            )}
        </div>
    );
}