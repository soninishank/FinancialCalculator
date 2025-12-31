
import React from 'react';
import ToggleSwitch from './ToggleSwitch';

export default function ToggleCard({
    checked,
    onChange,
    title,
    description,
    children,
    className = ""
}) {
    return (
        <div className={`flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100 transition-all duration-300 ${className}`}>
            <div className="flex items-center h-6">
                <ToggleSwitch
                    checked={checked}
                    onChange={onChange}
                />
            </div>

            <div className="flex-1 w-full min-w-0">
                <div
                    className="font-bold text-gray-700 text-sm block mb-1 cursor-pointer"
                    onClick={() => onChange(!checked)}
                >
                    {title}
                </div>

                {description && (
                    <p className="text-xs text-gray-500 mb-2">
                        {description}
                    </p>
                )}

                {checked && children && (
                    <div className="animate-fade-in w-full mt-3 pt-3 border-t border-gray-200/60">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}
