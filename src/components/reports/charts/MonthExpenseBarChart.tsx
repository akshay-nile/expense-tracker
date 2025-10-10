import type { TooltipItem } from 'chart.js';
import { Chart } from 'primereact/chart';
import { useEffect, useState } from 'react';
import type { MonthReport } from '../../../services/models';
import { formatRupee, formatRupeeK, mapRange } from '../../../services/utilities';

type Props = { expenses: Array<MonthReport>, dayCount: number };

function MonthExpenseBarChart({ expenses, dayCount }: Props) {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const cyanColor = documentStyle.getPropertyValue('--cyan-500');

        setChartData({
            labels: expenses.map(e => 'Day ' + e.day),
            datasets: [{ data: expenses.map(e => e.total), backgroundColor: cyanColor }]
        });

        setChartOptions({
            indexAxis: 'y',
            maintainAspectRatio: false,
            aspectRatio: mapRange(expenses.length, [1, dayCount], [1.33, 0.33]),
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: () => null,
                        title: (context: TooltipItem<'bar'>[]) => formatRupee(context[0].raw as number)
                    }
                }
            },
            scales: {
                x: { ticks: { color: textColor, callback: formatRupeeK } },
                y: { ticks: { color: textColor } }
            }
        });
    }, [expenses, dayCount]);

    return (Object.keys(chartData).length > 0 && Object.keys(chartOptions).length > 0)
        ? <Chart type="bar" data={chartData} options={chartOptions} /> : <></>;
};

export default MonthExpenseBarChart;
