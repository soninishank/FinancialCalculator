
import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { moneyFormat } from '../../utils/formatting';

// Register all commonly used components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// --- Base Options Generator ---
const getCommonOptions = (currency, isDecimal = false, overrideOptions = {}) => {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1f2937',
                bodyColor: '#374151',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    label: (context) => {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += moneyFormat(context.parsed.y, currency);
                        } else if (context.parsed !== null) {
                            // For Pie/Doughnut where data is directly in parsed (or raw)
                            label += moneyFormat(context.raw, currency);
                        }
                        return label;
                    }
                }
            },
            ...overrideOptions.plugins
        },
        scales: {
            y: {
                ticks: {
                    callback: (value) => moneyFormat(value, currency, true)
                },
                grid: {
                    color: '#f3f4f6'
                }
            },
            x: {
                grid: {
                    display: false
                }
            },
            ...overrideOptions.scales
        },
        ...overrideOptions
    };
};

export const FinancialLineChart = ({ data, currency, height = 320, options = {} }) => {
    const commonOptions = getCommonOptions(currency, false, options);
    return (
        <div style={{ height: height, width: '100%' }}>
            <Line data={data} options={commonOptions} />
        </div>
    );
};

export const FinancialBarChart = ({ data, currency, height = 320, options = {} }) => {
    const commonOptions = getCommonOptions(currency, false, options);
    return (
        <div style={{ height: height, width: '100%' }}>
            <Bar data={data} options={commonOptions} />
        </div>
    );
};

export const FinancialPieChart = ({ data, currency, height = 320, options = {} }) => {
    // Pie charts don't usually map scales the same way
    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += moneyFormat(context.raw, currency);
                        return label;
                    }
                }
            },
            ...options.plugins
        },
        ...options
    };

    return (
        <div style={{ height: height, width: '100%' }}>
            <Pie data={data} options={pieOptions} />
        </div>
    );
};

export const FinancialDoughnutChart = ({ data, currency, height = 320, options = {} }) => {
    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        label += moneyFormat(context.raw, currency);
                        return label;
                    }
                }
            },
            ...options.plugins
        },
        ...options
    };

    return (
        <div style={{ height: height, width: '100%' }}>
            <Doughnut data={data} options={doughnutOptions} />
        </div>
    );
};

// --- Specialized Components ---

// --- Specialized Components ---

export const FinancialCompoundingBarChart = ({ data, currency, type = 'investment' }) => {
    // --- DYNAMIC LABELS AND COLORS BASED ON TYPE ---
    let chartConfig = {};
    if (type === 'loan') {
        chartConfig = {
            title: "Principal vs. Interest Repayment",
            subtitle: "Visualizing the components of your annual payments.",
            labels: ["Principal Paid", "Interest Paid"],
            color1: "#60A5FA", // Blue-400 (Lighter, softer blue)
            color2: "#F87171", // Red-400 (Softer red)
            data1Key: 'principalPaid',
            data2Key: 'interestPaid',
            stackLabel: "Annual Payment"
        };
    } else {
        chartConfig = {
            title: "Wealth Compounding Projection",
            subtitle: "Visualizing how your principal amount and interest grow over time.",
            labels: ["Invested Amount", "Interest Gained"],
            // Using a more sophisticated palette
            color1: "#818CF8", // Indigo-400 (Soft Indigo)
            color2: "#2DD4BF", // Teal-400 (Soft Teal)
            data1Key: 'totalInvested',
            data2Key: 'growth',
            stackLabel: "Total Value"
        };
    }

    const chartData = {
        labels: data.map((row) => `Year ${row.year}`),
        datasets: [
            {
                label: chartConfig.labels[0],
                data: data.map((row) => row[chartConfig.data1Key]),
                backgroundColor: chartConfig.color1,
                hoverBackgroundColor: chartConfig.color1,
                // Make bars slightly thinner and rounded
                barPercentage: 0.6,
                categoryPercentage: 0.8,
                borderRadius: 4,
                stack: "Stack 0",
            },
            {
                label: chartConfig.labels[1],
                data: data.map((row) => row[chartConfig.data2Key]),
                backgroundColor: chartConfig.color2,
                hoverBackgroundColor: chartConfig.color2,
                borderRadius: 4, // Rounded tops for the stacked element too? 
                // Note: rounded corners on stacked bars can look weird if not handled carefully, 
                // but Chart.js v3+ handles it reasonably well.
                barPercentage: 0.6,
                categoryPercentage: 0.8,
                stack: "Stack 0",
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: "index",
            intersect: false,
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    maxTicksLimit: 6,
                    font: { size: 10, family: "'Inter', sans-serif" },
                    color: "#94a3b8" // Slate-400
                },
                border: { display: false },
            },
            y: {
                grid: {
                    color: "#f1f5f9", // Slate-100 (Very subtle)
                    borderDash: [4, 4]
                },
                stacked: true,
                ticks: {
                    callback: (value) => moneyFormat(value, currency, true),
                    font: { size: 10, weight: "500", family: "'Inter', sans-serif" },
                    color: "#64748B",
                    padding: 8,
                },
                border: { display: false },
            },
        },
        plugins: {
            legend: {
                position: "bottom",
                align: "center",
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    padding: 20,
                    font: { size: 12, weight: "500", family: "'Inter', sans-serif" },
                    color: "#475569" // Slate-600
                },
            },
            tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                titleColor: "#1E293B", // Late-800
                bodyColor: "#334155", // Slate-700
                borderColor: "#F1F5F9", // Slate-100 (Much cleaner)
                borderWidth: 1,
                padding: 12,
                cornerRadius: 12, // Softer corners
                displayColors: true,
                boxPadding: 6,
                callbacks: {
                    label: (context) => {
                        return ` ${context.dataset.label}: ${moneyFormat(context.raw, currency)}`;
                    },
                    footer: (tooltipItems) => {
                        const total = tooltipItems.reduce((a, b) => a + b.raw, 0);
                        return `${chartConfig.stackLabel}: ${moneyFormat(total, currency)}`;
                    },
                },
                footerFont: { weight: "bold", size: 11, family: "'Inter', sans-serif" },
                footerColor: "#0f172a", // Slate-900
                footerMarginTop: 10,
            },
        },
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm mt-8 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-gray-800 font-bold text-base sm:text-lg tracking-tight">{chartConfig.title}</h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mb-6 font-medium">
                {chartConfig.subtitle}
            </p>

            <div className="h-[300px] sm:h-[350px] w-full">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
};

export const FinancialInvestmentPieChart = ({ invested, gain, total, currency, years }) => {
    const [hoveredData, setHoveredData] = React.useState(null);
    const chartRef = React.useRef(null);

    // --- COLORS ---
    const COLOR_INVESTED = "#6366F1"; // Indigo-500
    const COLOR_RETURNS = "#14B8A6";  // Teal-500
    const COLOR_LOSS = "#EF4444";     // Red-500

    // Hover versions
    const HOVER_INVESTED = "#4F46E5";
    const HOVER_RETURNS = "#0D9488";
    const HOVER_LOSS = "#DC2626";

    const isLoss = gain < 0;
    const lossAmount = Math.abs(gain);

    // Configuration based on Profit vs Loss
    const chartConfig = isLoss ? {
        labels: ["Remaining Value", "Loss"],
        data: [total, lossAmount], // Total (Remaining) + Loss = Initial Invested
        backgroundColor: [COLOR_INVESTED, COLOR_LOSS],
        hoverBackgroundColor: [HOVER_INVESTED, HOVER_LOSS],
        legendLabels: [
            { label: "Remaining Value", val: total, color: COLOR_INVESTED },
            { label: "Loss", val: lossAmount, color: COLOR_LOSS }
        ]
    } : {
        labels: ["Invested Amount", "Est. Returns"],
        data: [invested, gain],
        backgroundColor: [COLOR_INVESTED, COLOR_RETURNS],
        hoverBackgroundColor: [HOVER_INVESTED, HOVER_RETURNS],
        legendLabels: [
            { label: "Invested Amount", val: invested, color: COLOR_INVESTED },
            { label: "Est. Returns", val: gain, color: COLOR_RETURNS }
        ]
    };

    const data = {
        labels: chartConfig.labels,
        datasets: [
            {
                data: chartConfig.data,
                backgroundColor: chartConfig.backgroundColor,
                hoverBackgroundColor: chartConfig.hoverBackgroundColor,
                borderWidth: 0,
                hoverOffset: 10,
                cutout: "82%",
            },
        ],
    };

    const options = {
        layout: { padding: 20 },
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
        },
        maintainAspectRatio: false,
        animation: { animateScale: true, animateRotate: true },
        onHover: (event, chartElement) => {
            if (chartElement.length > 0) {
                const index = chartElement[0].index;
                setHoveredData({
                    label: data.labels[index],
                    value: data.datasets[0].data[index],
                    color: data.datasets[0].backgroundColor[index],
                });
            } else {
                setHoveredData(null);
            }
        },
    };

    // Smartly handle the time label.
    // If 'years' is a number or numeric string, append " years".
    // If it already has text (e.g. "120 months"), leave it alone.
    const isNumeric = (val) => {
        if (typeof val === 'number') return true;
        if (typeof val === 'string') return /^\d+(\.\d+)?$/.test(val);
        return false;
    };

    const timeLabel = isNumeric(years) ? `${years} years` : years;

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center h-full">
            <h3 className="text-gray-500 font-medium mb-6 text-sm uppercase tracking-wide self-start pl-2">
                Asset Allocation
            </h3>

            <div className="relative h-64 w-64 mb-8">
                <Doughnut ref={chartRef} data={data} options={options} />

                {/* DYNAMIC CENTER TEXT */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center transition-all duration-200">
                    {hoveredData ? (
                        <>
                            <span className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-1">
                                {hoveredData.label}
                            </span>
                            <span
                                className="text-2xl font-extrabold"
                                style={{ color: hoveredData.color }}
                            >
                                {moneyFormat(hoveredData.value, currency, true)}
                            </span>
                        </>
                    ) : (
                        <>
                            <span className="text-gray-500 text-xs font-medium leading-tight">
                                After <strong className="text-gray-800">{timeLabel}</strong>, <br />
                                you will have
                            </span>
                            <span className={`text-3xl font-extrabold mt-2 ${isLoss ? "text-red-500" : "text-gray-800"}`}>
                                {moneyFormat(total, currency, true)}
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* LEGEND SECTION */}
            <div className="w-full px-4 space-y-6">
                {chartConfig.legendLabels.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                        <div
                            className="w-4 h-4 rounded-full mt-1 shrink-0"
                            style={{ backgroundColor: item.color }}
                        ></div>
                        <div className="flex flex-col">
                            <span className="text-gray-500 font-medium text-sm">
                                {item.label}
                            </span>
                            <span
                                className="text-xl font-bold"
                                style={{ color: item.color }}
                            >
                                {moneyFormat(item.val, currency)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const FinancialLoanPieChart = ({ principal, totalInterest, fees = 0, currency, years }) => {
    const [hoveredData, setHoveredData] = React.useState(null);
    const chartRef = React.useRef(null);

    // --- COLORS (Modern "Beautiful" Palette) ---
    const COLOR_PRINCIPAL = "#6366f1"; // Indigo-500
    const COLOR_INTEREST = "#2dd4bf";  // Teal-400
    const COLOR_FEES = "#fb7185";      // Rose-400

    const HOVER_PRINCIPAL = "#4f46e5";
    const HOVER_INTEREST = "#14b8a6";
    const HOVER_FEES = "#f43f5e";

    const totalAmount = principal + totalInterest + fees;

    // Labels corresponding to data
    const labels = ["Principal", "Interest", "Fees & Charges"];
    const datasetData = [principal, totalInterest, fees];
    const bgColors = [COLOR_PRINCIPAL, COLOR_INTEREST, COLOR_FEES];
    const hoverColors = [HOVER_PRINCIPAL, HOVER_INTEREST, HOVER_FEES];

    // Filter out zero values so they don't take up space or show in legend
    const validIndices = datasetData.map((val, idx) => val > 0 ? idx : -1).filter(idx => idx !== -1);

    const finalLabels = validIndices.map(idx => labels[idx]);
    const finalData = validIndices.map(idx => datasetData[idx]);
    const finalBgColors = validIndices.map(idx => bgColors[idx]);
    const finalHoverColors = validIndices.map(idx => hoverColors[idx]);

    const data = {
        labels: finalLabels,
        datasets: [
            {
                data: finalData,
                backgroundColor: finalBgColors,
                hoverBackgroundColor: finalHoverColors,
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 10,
                cutout: "0%", // PIE CHART in screenshot, not Doughnut
            },
        ],
    };

    const options = {
        layout: { padding: 20 },
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
        },
        maintainAspectRatio: false,
        animation: { animateScale: true, animateRotate: true },
        onHover: (event, chartElement) => {
            if (chartElement.length > 0) {
                const index = chartElement[0].index;
                setHoveredData({
                    label: data.labels[index],
                    value: data.datasets[0].data[index],
                    color: data.datasets[0].backgroundColor[index],
                });
            } else {
                setHoveredData(null);
            }
        },
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="relative h-64 w-64 mb-4">
                {/* Switch to Pie for screenshot match, or keep Doughnut? Screenshot looks like Pie but with a slice out. 
                   Actually screenshot shows it is a Pie Chart (full circle filled). I set cutout to 0%. */}
                <Pie ref={chartRef} data={data} options={options} />

                {/* DYNAMIC CENTER OVERLAY (For Pie, put it on top/side or just tooltip) 
                    Since it's a full Pie, center text doesn't work well. 
                    I'll show the hovered value as a floating label or just rely on the Legend updates below.
                */}
            </div>

            {/* LEGEND SECTION - Match Screenshot Layout */}
            <div className="flex flex-wrap justify-center gap-4 bg-gray-100 p-2 rounded-lg w-full">
                {validIndices.map((originalIdx) => (
                    <div key={originalIdx} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: bgColors[originalIdx] }}></div>
                        <span className="text-xs font-bold text-gray-700">{labels[originalIdx]}</span>
                    </div>
                ))}
            </div>

            {/* Hover Detail */}
            <div className="h-6 mt-2 text-center">
                {hoveredData && (
                    <p className="text-sm font-semibold text-gray-800">
                        {hoveredData.label}: {moneyFormat(hoveredData.value, currency)}
                    </p>
                )}
            </div>
        </div>
    );
};
