import type { TooltipItem } from 'chart.js';
import { Chart } from 'primereact/chart';
import { useEffect, useState } from 'react';
import { formatRupee } from '../../../services/utilities';

type Props = { estimatedTotal: number, actualTotal: number };

function EstimationPieChart({ estimatedTotal, actualTotal }: Props) {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        const remainingEstimate = estimatedTotal - actualTotal;
        const documentStyle = getComputedStyle(document.documentElement);

        setChartData({
            labels: ['Actual Total', 'Remaining Estimate'],
            datasets: [{
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
                borderColor: 'transparent'
            }]
        });

        setChartOptions({
            responsive: true,
            maintainAspectRatio: false,
            aspectRatio: 1,
            cutout: '66%',
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    align: 'center',
                    labels: {
                        color: documentStyle.getPropertyValue('--text-color'),
                        font: { size: 13 },
                        boxWidth: 15,
                        boxHeight: 15,
                        padding: 20,
                    }
                },
                tooltip: {
                    callbacks: {
                        label: () => null,
                        title: (context: TooltipItem<'doughnut'>[]) => formatRupee(context[0].raw as number)
                    }
                }
            },
        });
    }, [actualTotal, estimatedTotal]);

    return (Object.keys(chartData).length > 0 && Object.keys(chartOptions).length > 0)
        ? <Chart type="doughnut" data={chartData} options={chartOptions} /> : <></>;
};

export default EstimationPieChart;
