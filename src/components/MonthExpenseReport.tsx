import { useEffect, useRef, useState } from "react";
import type { MonthReport } from "../services/models";

import { Chip } from "primereact/chip";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { OverlayPanel } from "primereact/overlaypanel";
import { ProgressSpinner } from "primereact/progressspinner";
import { getReportOfMonthExpenses } from "../services/expenses";
import { addMissingDays, formatRupee } from "../services/utilities";
import CategoriesReport from "./CategoriesReport";

type Props = { monthKey: string, today: Date };

function MonthExpenseReport({ today, monthKey }: Props) {
    const toChips = (p: string) => p.split(', ').map((s: string) => <Chip label={s} key={s} style={{ fontSize: 'smaller', borderRadius: '0.4rem', margin: '0.2rem' }} />);
    const opRef = useRef<OverlayPanel | null>(null);

    const [loading, setLoading] = useState<boolean>(false);
    const [actualTotal, setActualTotal] = useState(0);
    const [estimatedTotal, setEstimatedTotal] = useState(0);
    const [dayCount, setDayCount] = useState(0);
    const [expenses, setExpenses] = useState<MonthReport[]>([]);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getReportOfMonthExpenses(monthKey);
                const actualTotal = data.map(d => d.total).reduce((a, b) => a + b, 0);
                setActualTotal(actualTotal);

                const splits = monthKey.split('/');
                const dayCount = new Date(parseInt(splits[1]), parseInt(splits[2]), 0).getDate();
                setDayCount(dayCount);

                addMissingDays(data, today, monthKey, true);
                setExpenses(data);

                const estimatedTotal = Math.round((actualTotal / data.length) * dayCount);
                setEstimatedTotal(estimatedTotal);
            }
            catch (error) { console.error(error); }
            finally { setLoading(false); }
        })();
    }, [today, monthKey]);

    return (
        loading
            ? <ProgressSpinner strokeWidth="0.12rem" animationDuration="0.5s" aria-label="Loading Report"
                style={{ width: '100%', height: '10rem', marginTop: '33%' }} />
            : actualTotal === 0
                ? <div className=" my-[12rem] text-center text-2xl">No Expense</div>
                : <div>
                    <div className="flex justify-around items-center">
                        <div onClick={e => opRef.current?.toggle(e)}
                            className="text-xl text-center tracking-wider font-semibold cursor-pointer">
                            {formatRupee(actualTotal)}
                            <div className="text-xs tracking-normal font-light mt-0.2">
                                {estimatedTotal !== actualTotal && 'Actual '}
                                Total of <b>{expenses.length}</b> Days
                            </div>
                        </div>
                        {
                            estimatedTotal !== actualTotal &&
                            <div className="text-xl text-center tracking-wider font-semibold">
                                {formatRupee(estimatedTotal)}
                                <div className="text-xs tracking-normal font-light mt-0.2">
                                    Estimated Total of <b>{dayCount}</b> Days
                                </div>
                            </div>
                        }
                    </div>
                    <div className="w-full mt-3">
                        <DataTable value={expenses} showGridlines size="small" tableStyle={{ fontSize: '15px' }}>
                            <Column field="day" header="Day" align="center" bodyStyle={{ textAlign: 'center' }} />
                            <Column field="purpose" header="Expenses" align="center"
                                body={row => toChips(row.purpose)} bodyStyle={{ textAlign: 'left' }} />
                            <Column field="total" header="Total" align="center" bodyStyle={{ textAlign: 'center' }}
                                body={row => formatRupee(row.total)} />
                        </DataTable>
                        <OverlayPanel ref={opRef} showCloseIcon>
                            <CategoriesReport reportKey={monthKey} />
                        </OverlayPanel>
                    </div>
                </div>
    );
}

export default MonthExpenseReport;