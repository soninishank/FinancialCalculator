import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useChartData, getChartOptions } from './BiddingChartLogic';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function BiddingChart({ data }) {
    const chartData = useChartData(data);
    const options = getChartOptions();

    if (!chartData) return null;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
                Bidding Demand Graph
            </h3>
            <Line options={options} data={chartData} />
            <p className="text-xs text-gray-400 mt-4 text-center">
                * Cumulative bid quantity includes bids at that price point and above.
            </p>
        </div>
    );
}
