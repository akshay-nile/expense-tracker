import { useEffect, useRef, useState } from "react";
import type { YearReport } from "../../services/models";

import { Chip } from "primereact/chip";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { OverlayPanel } from "primereact/overlaypanel";
import { Panel } from "primereact/panel";
import { ProgressSpinner } from "primereact/progressspinner";
import { TabPanel, TabView } from "primereact/tabview";
import { getReportOfYearExpenses } from "../../services/expenses";
import { addMissingMonths, formatRupee, formatShortMonth } from "../../services/utilities";
import CategorizedReport from "./CategorizedReport";
import EstimationPieChart from "./charts/EstimationPieChart";
import YearExpenseBarChart from "./charts/YearExpenseBarChart";

type Props = { yearKey: string, today: Date };

function YearExpenseReport({ today, yearKey }: Props) {
    const toChips = (p: string) => p.split(', ').map((s: string) => <Chip label={s} key={s} style={{ fontSize: 'smaller', borderRadius: '0.4rem', margin: '0.2rem' }} />);
    const opRef = useRef<OverlayPanel | null>(null);

    const [loading, setLoading] = useState<boolean>(false);
    const [actualTotal, setActualTotal] = useState(0);
    const [estimatedTotal, setEstimatedTotal] = useState(0);
    const [expenses, setExpenses] = useState<YearReport[]>([]);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getReportOfYearExpenses(yearKey);
                const actualTotal = data.map(d => d.total).reduce((a, b) => a + b, 0);
                setActualTotal(actualTotal);

                addMissingMonths(data, today, yearKey, true);
                setExpenses(data);

                const estimatedTotal = Math.round((actualTotal / data.length) * 12);
                setEstimatedTotal(estimatedTotal);
            }
            catch (error) { console.error(error); }
            finally { setLoading(false); }
        })();
    }, [today, yearKey]);

    return (
        loading
            ? <ProgressSpinner strokeWidth="0.12rem" animationDuration="0.5s" aria-label="Loading Report"
                style={{ width: '100%', height: '10rem', marginTop: '33%' }} />
            : actualTotal === 0
                ? <div className=" my-[12rem] text-center text-2xl">No Expense</div>
                : <div>
                    <div className="flex justify-around items-center">
                        <div className="text-xl text-center tracking-wider font-semibold cursor-pointer">
                            {formatRupee(actualTotal)}
                            <div className="text-xs tracking-normal font-light mt-0.2">
                                {estimatedTotal !== actualTotal && 'Actual '}
                                Total of <b>{expenses.length}</b> Months
                            </div>
                        </div>
                        {
                            estimatedTotal !== actualTotal &&
                            <div onClick={e => opRef.current?.toggle(e)}
                                className="text-xl text-center tracking-wider font-semibold cursor-pointer">
                                {formatRupee(estimatedTotal)}
                                <div className="text-xs tracking-normal font-light mt-0.2">
                                    Estimated Total of <b>12</b> Months
                                </div>
                            </div>
                        }
                    </div>
                    <div className="w-full mt-3">
                        <TabView>
                            <TabPanel header="Tabular" leftIcon="pi pi-table me-2" headerClassName="text-xs flex-1">
                                <div className="p-3 py-3.5">
                                    <DataTable value={expenses} showGridlines size="small" tableStyle={{ fontSize: '15px' }} >
                                        <Column field="month" header="Month" align="center" bodyStyle={{ textAlign: 'center' }}
                                            body={row => formatShortMonth(row.month)} />
                                        <Column field="purpose" header="Expenses" align="center"
                                            body={row => toChips(row.purpose)} bodyStyle={{ textAlign: 'left' }} />
                                        <Column field="total" header="Total" align="center" bodyStyle={{ textAlign: 'center' }}
                                            body={row => formatRupee(row.total)} />
                                    </DataTable>
                                </div>
                            </TabPanel>

                            <TabPanel header="Graphical" leftIcon="pi pi-chart-bar me-2" headerClassName="text-xs flex-1">
                                {
                                    estimatedTotal !== actualTotal &&
                                    <Panel header="Remaining Estimation" className="p-3 pt-3.5 pb-0">
                                        <EstimationPieChart actualTotal={actualTotal} estimatedTotal={estimatedTotal} />
                                    </Panel>
                                }
                                <Panel header="Monthly Expenditure" className="p-3 py-3.5">
                                    <YearExpenseBarChart expenses={expenses} />
                                </Panel>
                            </TabPanel>

                            <TabPanel header="Categorized" leftIcon="pi pi-bars me-2" headerClassName="text-xs flex-1">
                                <CategorizedReport reportKey={yearKey} actualTotal={actualTotal} />
                            </TabPanel>
                        </TabView>

                        <OverlayPanel ref={opRef} showCloseIcon>
                            <div className="m-3">
                                <b>{Math.round(((expenses.length - 1 + today.getDate() / 31) / 12) * 100)}%</b> Accurate
                            </div>
                        </OverlayPanel>
                    </div>
                </div>
    );
}

export default YearExpenseReport;