import { Chart } from "primereact/chart";
import { useEffect, useState } from "react";
import { formatRupee } from "../services/utilities";
import type { TooltipItem } from "chart.js";

type Props = { estimatedTotal: number, actualTotal: number };

function EstimatedTotalChart({ estimatedTotal, actualTotal }: Props) {
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
                        documentStyle.getPropertyValue('--blue-500'),
                        documentStyle.getPropertyValue('--orange-500')
                    ],
                    hoverBackgroundColor: [
                        documentStyle.getPropertyValue('--blue-400'),
                        documentStyle.getPropertyValue('--orange-400')
                    ]
                }
            ]
        });

        setChartOptions({
            cutout: '66%',
            plugins: {
                legend: {
                    display: true,
                    position: "bottom",
                    align: "start",
                    labels: {
                        color: documentStyle.getPropertyValue('--text-color'),
                        font: { size: 14 },
                        fullSize: true,
                        boxWidth: 15,
                        boxHeight: 15,
                        padding: 15,
                    },
                },
                tooltip: {
                    callbacks: {
                        label: () => null,
                        title: (context: TooltipItem<"doughnut">) => context.label
                    }
                }
            },
        });
    }, [actualTotal, remainingEstimate]);

    return (
        <div className="flex justify-center m-2 mt-5">
            <Chart type="doughnut" data={chartData} options={chartOptions} />
        </div>
    );
};

export default EstimatedTotalChart;
