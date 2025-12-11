import { useMemo } from 'react';

export function useChartData(data) {
    return useMemo(() => {
        if (!data || data.length === 0) return null;

        // Sort by price value naturally if possible
        // Cut-Off usually is the highest price or separate.
        // Let's rely on the order from backend or ensure sort.
        // Backend sorts by price_value ASC NULLS LAST.
        // 'Cut-Off' will be last.

        return {
            labels: data.map(d => d.price_label),
            datasets: [
                {
                    label: 'Cumulative Demand (Quantity)',
                    data: data.map(d => parseInt(d.cumulative_quantity, 10)),
                    borderColor: 'rgb(59, 130, 246)', // Blue 500
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 2,
                }
            ]
        };
    }, [data]);
}

export const getChartOptions = () => ({
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                usePointStyle: true,
                font: {
                    family: "'Inter', sans-serif",
                    size: 12
                }
            }
        },
        title: {
            display: false,
        },
        tooltip: {
            callbacks: {
                label: (context) => {
                    let label = context.dataset.label || '';
                    if (label) {
                        label += ': ';
                    }
                    if (context.parsed.y !== null) {
                        label += new Intl.NumberFormat('en-IN').format(context.parsed.y);
                    }
                    return label;
                }
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                callback: (value) => {
                    if (value >= 10000000) return (value / 10000000).toFixed(1) + ' Cr';
                    if (value >= 100000) return (value / 100000).toFixed(1) + ' L';
                    return value;
                },
                font: {
                    size: 11
                }
            },
            grid: {
                color: 'rgba(0, 0, 0, 0.05)'
            }
        },
        x: {
            grid: {
                display: false
            },
            title: {
                display: true,
                text: 'Price (₹) / Category',
                font: {
                    size: 12,
                    weight: 'bold'
                }
            }
        }
    },
    interaction: {
        mode: 'index',
        intersect: false,
    },
});
