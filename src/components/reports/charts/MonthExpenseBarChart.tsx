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

        setChartData({
            labels: expenses.map(e => 'Day ' + e.day),
            datasets: [{
                data: expenses.map(e => e.total),
                backgroundColor: documentStyle.getPropertyValue('--blue-500'),
                borderColor: documentStyle.getPropertyValue('--blue-500')
            }]
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
                x: { ticks: { color: textColor, callback: (n: number) => formatRupee(n) } },
                y: { ticks: { color: textColor } }
            }
        });
    }, [expenses]);

    return <Chart type="bar" data={chartData} options={chartOptions} />;
};

export default MonthExpenseBarChart;
