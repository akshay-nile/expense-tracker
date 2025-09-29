import { useEffect, useState } from "react";
import type { MonthReport } from "../services/models";

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ProgressSpinner } from "primereact/progressspinner";
import { getReportOfMonthExpenses } from "../services/expenses";
import { addMissingDays, formatRupee } from "../services/utilities";

type Props = {
    today: Date,
    monthKey: string,
    total: number
};

function MonthExpenseReport({ today, monthKey, total }: Props) {
    const [loading, setLoading] = useState<boolean>(false);
    const [estimatedTotal, setEstimatedTotal] = useState(0);
    const [dayCount, setDayCount] = useState(0);
    const [expenses, setExpenses] = useState<MonthReport[]>([]);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                if (total === 0) return;
                const data = await getReportOfMonthExpenses(monthKey);

                const splits = monthKey.split('/');
                const dayCount = new Date(parseInt(splits[1]), parseInt(splits[2]), 0).getDate();
                setDayCount(dayCount);

                addMissingDays(data, today, monthKey, true);
                setExpenses(data);

                const estimatedTotal = Math.round((total / data.length) * dayCount);
                setEstimatedTotal(estimatedTotal);
            }
            catch (error) { console.error(error); }
            finally { setLoading(false); }
        })();
    }, [today, monthKey, total]);

    return (
        loading
            ? <ProgressSpinner style={{ width: '100%', height: '3em' }} strokeWidth="0.3em" animationDuration="0.5s" aria-label="Loading" />
            : total === 0
                ? <div className="text-center my-3 text-lg cursor-pointer">No Expense</div>
                : <div>
                    <div className="flex justify-around items-center">
                        {
                            estimatedTotal !== total &&
                            <div className="text-xl text-center tracking-wider font-semibold">
                                {formatRupee(estimatedTotal)}
                                <div className="text-xs tracking-normal font-light mt-0.2">
                                    Estimated Total of <b>{dayCount}</b> Days
                                </div>
                            </div>
                        }
                        <div className="text-xl text-center tracking-wider font-semibold">
                            {formatRupee(total)}
                            <div className="text-xs tracking-normal font-light mt-0.2">
                                Actual Total of <b>{expenses.length}</b> Days
                            </div>
                        </div>
                    </div>
                    <div className="w-full mt-2.5">
                        <DataTable value={expenses} showGridlines size="small"
                            tableStyle={{ fontSize: 'small' }} >
                            <Column field="day" header="Day" align="center" style={{ textAlign: 'center' }} />
                            <Column field="purpose" header="Expenses" align="center" style={{ textAlign: 'left' }} />
                            <Column field="total" header="Total" align="center" style={{ textAlign: 'left' }}
                                body={row => formatRupee(row.total)} />
                        </DataTable>
                    </div>
                </div>
    );
}

export default MonthExpenseReport;