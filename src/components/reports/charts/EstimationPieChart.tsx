import { Chart } from "primereact/chart";
import { useEffect, useState } from "react";
import { formatRupee } from "../../../services/utilities";
import type { TooltipItem } from "chart.js";

type Props = { estimatedTotal: number, actualTotal: number };

function EstimationPieChart({ estimatedTotal, actualTotal }: Props) {
    const remainingEstimate = estimatedTotal - actualTotal;

    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        const documentStyle = getComputedStyle(document.documentElement);

        setChartData({
            labels: [
                `Actual Total ${formatRupee(actualTotal)}`,
                `Remaining Estimate ${formatRupee(remainingEstimate)}`
            ],
            datasets: [
                {
                    data: [actualTotal, remainingEstimate],
                    backgroundColor: [
                        documentStyle.getPropertyValue('--cyan-500'),
                        documentStyle.getPropertyValue('--orange-400')
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--cyan-600'),
                        documentStyle.getPropertyValue('--orange-600')
                    ],
                    borderWidth: 0,
                    borderColor: "transparent"
                }
            ]
        });

        setChartOptions({
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
            cutout: '66%',
            plugins: {
                legend: {
                    display: true,
                    position: "bottom",
                    align: "center",
                    labels: {
                        color: documentStyle.getPropertyValue('--text-color'),
                        font: { size: 14 },
                        boxWidth: 15,
                        boxHeight: 15,
                        padding: 15,
                    }
                },
                tooltip: {
                    callbacks: {
                        label: () => null,
                        title: (context: TooltipItem<"doughnut">[]) => formatRupee(context[0].raw as number)
                    }
                }
            },
        });
    }, [actualTotal, remainingEstimate]);

    return <Chart type="doughnut" data={chartData} options={chartOptions} />;
};

export default EstimationPieChart;
