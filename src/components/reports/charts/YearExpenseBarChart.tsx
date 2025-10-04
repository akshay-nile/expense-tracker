import type { TooltipItem } from "chart.js";
import { Chart } from "primereact/chart";
import { useEffect, useState } from "react";
import type { YearReport } from "../../../services/models";
import { formatRupee, formatShortMonth } from "../../../services/utilities";

type Props = { expenses: Array<YearReport> };

function YearExpenseBarChart({ expenses }: Props) {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const cyanColor = documentStyle.getPropertyValue('--cyan-500');

        setChartData({
            labels: expenses.map(e => formatShortMonth(e.month)),
            datasets: [{ data: expenses.map(e => e.total), backgroundColor: cyanColor }]
        });

        setChartOptions({
            indexAxis: 'x',
            maintainAspectRatio: false,
            aspectRatio: 0.6,
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
                x: { ticks: { color: textColor } },
                y: { ticks: { color: textColor, callback: (n: number) => formatRupee(n / 1000) + 'K' } }
            }
        });
    }, [expenses]);

    return <Chart type="bar" data={chartData} options={chartOptions} />;
};

export default YearExpenseBarChart;
