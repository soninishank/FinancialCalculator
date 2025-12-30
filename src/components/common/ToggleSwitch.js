import React from 'react';

export default function ToggleSwitch({ checked, onChange, className = '' }) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onChange(!checked);
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${checked ? 'bg-teal-600' : 'bg-gray-300'
                } ${className}`}
            role="switch"
            aria-checked={checked}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
            />
        </button>
    );
}
