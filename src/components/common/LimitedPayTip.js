import React from "react";

/**
 * A common component to display a "Pro Tip" message for Limited Pay (Stop SIP Early) logic.
 * @param {Object} props
 * @param {boolean} props.show - Whether to show the tip.
 */
export default function LimitedPayTip({ show }) {
    if (!show) return null;

    return (
        <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 animate-fade-in">
            <div className="text-amber-500 mt-0.5">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                    />
                </svg>
            </div>
            <div className="text-[11px] leading-relaxed text-amber-900">
                <span className="font-bold text-amber-950">Pro Tip: </span>
                Even if you stop your SIP early, your existing corpus continues to grow
                until the end of the total tenure. This is a powerful strategy to build
                wealth early!
            </div>
        </div>
    );
}
