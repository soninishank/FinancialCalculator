
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
import { CHART_COLORS } from '../../utils/constants';

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
            // Standard Wealth Projection
            title: "Wealth Compounding Projection",
            subtitle: "Visualizing how your principal amount and interest grow over time.",
            labels: ["Invested Amount", "Interest Gained"],
            // Using a more sophisticated palette
            color1: CHART_COLORS.SECONDARY, // Use constant
            color2: CHART_COLORS.PRIMARY, // Use constant
            data1Key: 'totalInvested',
            data2Key: 'growth',
            stackLabel: "Total Value"
        };
    }

    const chartData = {
        labels: data.map((row) => `Year ${row.year}`),
        datasets: [
            {
                type: 'line',
                label: chartConfig.labels[0], // Same label as first bar
                data: data.map((row) => row[chartConfig.data1Key]),
                borderColor: '#92400e', // Amber-800: Strong visible trend line (Brown)
                borderWidth: 2,
                pointRadius: 4, // Visible points (dotted look)
                pointHoverRadius: 6,
                pointBackgroundColor: '#92400e', // Match line color
                pointBorderColor: '#ffffff', // White border for contrast
                pointBorderWidth: 2,
                fill: false,
                tension: 0.1,
                order: 0,
            },
            {
                type: 'bar',
                label: chartConfig.labels[0],
                data: data.map((row) => row[chartConfig.data1Key]),
                backgroundColor: chartConfig.color1,
                hoverBackgroundColor: chartConfig.color1,
                // Make bars slightly thinner and rounded
                barPercentage: 0.6,
                categoryPercentage: 0.8,
                borderRadius: 4,
                stack: "Stack 0",
                order: 1,
            },
            {
                type: 'bar',
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
                order: 1,
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
                    color: "#475569", // Slate-600
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

            <div className="h-[400px] sm:h-[350px] w-full">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
};

export const FinancialInvestmentPieChart = ({ invested, gain, total, currency, years }) => {
    // --- COLORS ---
    const COLOR_INVESTED = CHART_COLORS.SECONDARY; // Blue/Indigo
    const COLOR_RETURNS = CHART_COLORS.PRIMARY;  // Teal
    const COLOR_LOSS = CHART_COLORS.DANGER;     // Red

    // Hover versions (Calculated or hardcoded specific)
    const HOVER_INVESTED = CHART_COLORS.SECONDARY;
    const HOVER_RETURNS = CHART_COLORS.PRIMARY;
    const HOVER_LOSS = CHART_COLORS.DANGER;

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
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 10,
            },
        ],
    };

    const options = {
        layout: { padding: 20 },
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                padding: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                titleColor: '#1E293B',
                bodyColor: '#334155',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: (context) => {
                        return ` ${context.label}: ${moneyFormat(context.raw, currency)}`;
                    }
                },
                // Improve performance
                animation: {
                    duration: 0
                }
            },
        },
        maintainAspectRatio: false,
        animation: { animateScale: true, animateRotate: true },
    };


    return (
        <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square mb-6">
                <Pie data={data} options={options} />
            </div>

            {/* LEGEND SECTION - Match LoanEMI Style */}
            <div className="flex flex-wrap justify-center gap-4 bg-gray-100 p-2 rounded-lg w-full max-w-md">
                {chartConfig.legendLabels.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-xs font-bold text-gray-700">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const FinancialLoanPieChart = ({ principal, totalInterest, fees = 0, currency, years }) => {
    // --- COLORS (Modern "Beautiful" Palette) ---
    const COLOR_PRINCIPAL = "#6366f1"; // Indigo-500
    const COLOR_INTEREST = "#2dd4bf";  // Teal-400
    const COLOR_FEES = "#fb7185";      // Rose-400

    const HOVER_PRINCIPAL = "#4f46e5";
    const HOVER_INTEREST = "#14b8a6";
    const HOVER_FEES = "#f43f5e";


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
            tooltip: {
                enabled: true,
                padding: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.98)',
                titleColor: '#1E293B',
                bodyColor: '#334155',
                borderColor: '#e5e7eb',
                borderWidth: 1,
                cornerRadius: 8,
                callbacks: {
                    label: (context) => ` ${context.label}: ${moneyFormat(context.raw, currency)}`
                },
                // Improve performance
                animation: {
                    duration: 0
                }
            },
        },
        maintainAspectRatio: false,
        animation: { animateScale: true, animateRotate: true },
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square mb-6">
                {/* Switch to Pie for screenshot match, or keep Doughnut? Screenshot looks like Pie but with a slice out. 
                   Actually screenshot shows it is a Pie Chart (full circle filled). I set cutout to 0%. */}
                <Pie data={data} options={options} />
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
        </div>
    );
};
export const FinancialLoanDoughnutChart = ({
    upfront,
    principal,
    prepayments,
    interest,
    taxes,
    insurance,
    currency,
    total
}) => {
    // Labels and data mapping
    const labels = [
        "Initial Payment (DP + Fees)",
        "Principal Amount",
        "Extra Part-Payments",
        "Total Interest Paid",
        "Property Taxes",
        "Home Insurance & Maintenance"
    ];
    const datasetData = [upfront, principal, prepayments, interest, taxes, insurance];
    const bgColors = ["#f43f5e", "#84cc16", "#14b8a6", "#f59e0b", "#8b5cf6", "#6366f1"];
    const hoverColors = ["#e11d48", "#65a30d", "#0d9488", "#d97706", "#7c3aed", "#4f46e5"];

    const data = {
        labels,
        datasets: [{
            data: datasetData,
            backgroundColor: bgColors,
            hoverBackgroundColor: hoverColors,
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 4,
            cutout: "85%"
        }]
    };

    const centerTextPlugin = {
        id: 'centerText',
        beforeDraw: (chart) => {
            const { ctx, chartArea } = chart;
            if (!chartArea) return;

            ctx.restore();

            const height = chartArea.bottom - chartArea.top;
            const fontSize = (height / 16).toFixed(2); // Slightly larger relative to chart area
            ctx.font = `bold ${fontSize}px 'Inter', sans-serif`;
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#1e293b';

            const centerX = (chartArea.left + chartArea.right) / 2;
            const centerY = (chartArea.top + chartArea.bottom) / 2;
            const lineHeight = parseInt(fontSize) * 1.1;

            // Draw 3 lines
            ctx.fillText('Total', centerX, centerY - lineHeight);
            ctx.fillText('of all', centerX, centerY);
            ctx.fillText('Payments', centerX, centerY + lineHeight);

            ctx.save();
        }
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: 25 },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 11, weight: '600', family: "'Inter', sans-serif" }
                }
            },
            tooltip: {
                enabled: true,
                padding: 12,
                borderRadius: 8,
                callbacks: {
                    label: (context) => ` ${context.label}: ${moneyFormat(context.raw, currency)}`
                }
            }
        },
        animation: {
            animateScale: true,
            animateRotate: true
        }
    };

    return (
        <div className="relative h-[450px] sm:h-[400px] w-full mt-4">
            <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
        </div>
    );
};
