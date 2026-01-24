import React, { useState, useEffect } from 'react';
import { useUrlState } from '../../../hooks/useUrlState';
import InputWithSlider from '../../common/InputWithSlider';

const DividendYieldCalculator = ({ currency }) => {
    const [stockPrice, setStockPrice] = useUrlState('price', 100);
    const [dividendPerShare, setDividendPerShare] = useUrlState('div', 5);
    const [yieldValue, setYieldValue] = useState(0);

    useEffect(() => {
        const price = parseFloat(stockPrice) || 0;
        const div = parseFloat(dividendPerShare) || 0;

        if (price > 0) {
            setYieldValue((div / price) * 100);
        } else {
            setYieldValue(0);
        }
    }, [stockPrice, dividendPerShare]);

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-6">
                <InputWithSlider
                    label="Current Stock Price"
                    value={stockPrice}
                    onChange={setStockPrice}
                    min={0}
                    max={50000}
                    step={10}
                    currency={currency}
                />
                <InputWithSlider
                    label="Annual Dividend Per Share"
                    value={dividendPerShare}
                    onChange={setDividendPerShare}
                    min={0}
                    max={1000}
                    step={0.5}
                    currency={currency}
                />
            </div>

            <div className="flex-1">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col items-center justify-center text-center h-full">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Dividend Yield</p>
                    <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600 mb-2">
                        {!isNaN(yieldValue) ? yieldValue.toFixed(2) : "0.00"}%
                    </h2>
                    <p className="text-gray-400 text-sm">Return on investment from dividends alone</p>
                </div>
            </div>
        </div>
    );
};

export default DividendYieldCalculator;
