import type { TooltipItem } from "chart.js";
import { Chart } from "primereact/chart";
import { useEffect, useState } from "react";
import type { MonthReport } from "../../../services/models";
import { formatRupee } from "../../../services/utilities";

type Props = { expenses: Array<MonthReport> };

function MonthExpenseBarChart({ expenses }: Props) {
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
            aspectRatio: (expenses.length <= 7) ? 1.0 : (expenses.length <= 14) ? 0.8 : (expenses.length <= 21) ? 0.6 : 0.4,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: () => null,
                        title: (context: TooltipItem<"bar">[]) => formatRupee(context[0].raw as number)
                    }
                }
            },
            scales: {
                x: { ticks: { color: textColor, callback: (n: number) => '₹' + (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n) } },
                y: { ticks: { color: textColor } }
            }
        });
    }, [expenses]);

    return (Object.keys(chartData).length > 0 && Object.keys(chartOptions).length > 0)
        ? <Chart type="bar" data={chartData} options={chartOptions} /> : <></>;
};

export default MonthExpenseBarChart;
