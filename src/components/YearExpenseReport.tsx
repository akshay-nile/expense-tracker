import { useEffect, useState } from "react";
import type { YearReport } from "../services/models";

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ProgressSpinner } from "primereact/progressspinner";
import { getReportOfYearExpenses } from "../services/expenses";
import { addMissingMonths, formatRupee, formatShortMonth } from "../services/utilities";
import { Chip } from "primereact/chip";

type Props = { yearKey: string, today: Date };

function YearExpenseReport({ today, yearKey }: Props) {
    const toChips = (p: string) => p.split(', ').map((s: string) => <Chip label={s} style={{ fontSize: 'smaller', borderRadius: '0.4rem', margin: '0.2rem' }} />);

    const [loading, setLoading] = useState<boolean>(false);
    const [actualTotal, setActualTotal] = useState(0);
    const [estimatedTotal, setEstimatedTotal] = useState(0);
    const [monthCount, setMonthCount] = useState(0);
    const [expenses, setExpenses] = useState<YearReport[]>([]);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getReportOfYearExpenses(yearKey);
                const actualTotal = data.map(d => d.total).reduce((a, b) => a + b, 0);
                setActualTotal(actualTotal);

                const monthCount = new Date(parseInt(yearKey.split('/')[1]), 0, 0).getMonth() + 1;
                setMonthCount(monthCount);

                addMissingMonths(data, today, yearKey, true);
                setExpenses(data);

                const estimatedTotal = Math.round((actualTotal / data.length) * monthCount);
                setEstimatedTotal(estimatedTotal);
            }
            catch (error) { console.error(error); }
            finally { setLoading(false); }
        })();
    }, [today, yearKey]);

    return (
        loading
            ? <ProgressSpinner strokeWidth="0.12rem" animationDuration="0.5s" aria-label="Loading Report"
                style={{ width: '100%', height: '11rem', marginTop: '33%' }} />
            : actualTotal === 0
                ? <div className=" my-[12rem] text-center text-2xl">No Expense</div>
                : <div>
                    <div className="flex justify-around items-center">
                        {
                            estimatedTotal !== actualTotal &&
                            <div className="text-xl text-center tracking-wider font-semibold">
                                {formatRupee(estimatedTotal)}
                                <div className="text-xs tracking-normal font-light mt-0.2">
                                    Estimated Total of <b>{monthCount}</b> Months
                                </div>
                            </div>
                        }
                        <div className="text-xl text-center tracking-wider font-semibold">
                            {formatRupee(actualTotal)}
                            <div className="text-xs tracking-normal font-light mt-0.2">
                                {estimatedTotal !== actualTotal && 'Actual '}
                                Total of <b>{expenses.length}</b> Months
                            </div>
                        </div>
                    </div>
                    <div className="w-full mt-3">
                        <DataTable value={expenses} showGridlines size="small" tableStyle={{ fontSize: '15px' }} >
                            <Column field="month" header="Month" align="center" bodyStyle={{ textAlign: 'center' }}
                                body={row => formatShortMonth(row.month)} />
                            <Column field="purpose" header="Expenses" align="center" bodyStyle={{ textAlign: 'left' }}
                                body={row => toChips(row.purpose)} />
                            <Column field="total" header="Total" align="center" bodyStyle={{ textAlign: 'center' }}
                                body={row => formatRupee(row.total)} />
                        </DataTable>
                    </div>
                </div>
    );
}

export default YearExpenseReport;