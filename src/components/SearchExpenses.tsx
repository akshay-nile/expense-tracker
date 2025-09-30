import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { useState } from "react";
import { getSearchedExpenses } from "../services/expenses";
import type { SearchedExpense } from "../services/models";
import { formatRupee, formatShortDate, toastMessage } from "../services/utilities";

function SearchExpenses() {
    const toTotal = (expenses: SearchedExpense[]) => formatRupee(expenses.map(e => e.amount).reduce((a, b) => a + b, 0));

    const [icon, setIcon] = useState<'search' | 'times' | 'spinner pi-spin'>('search');
    const [searchValue, setSearchValue] = useState<string>('');
    const [expenses, setExpenses] = useState<SearchedExpense[]>([]);

    async function searchForExpenses() {
        if (icon === 'times') {
            editSearchValue('');
            return;
        }
        setIcon('spinner pi-spin');
        const data = await getSearchedExpenses(searchValue.trim());
        if (!data.length) toastMessage.show({
            severity: 'warn', summary: 'No Results Found',
            detail: 'Did not find any expense with matching purpose'
        });
        setExpenses(data);
        setIcon('times');
    }

    function editSearchValue(value: string) {
        setSearchValue(value);
        setIcon('search');
        setExpenses([]);
    }

    function onEnterOrEscapeKey(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            if (searchValue.trim().length && icon === 'search') searchForExpenses();
            return;
        }
        if (e.key === "Escape" || e.key === "Esc") editSearchValue('');
    };

    return (
        <div>
            <div className="p-inputgroup flex-1">
                <InputText placeholder="Search Expenses"
                    value={searchValue}
                    onChange={e => editSearchValue(e.target.value)}
                    onKeyDown={onEnterOrEscapeKey} />
                <Button icon={`pi pi-${icon}`} outlined
                    disabled={!searchValue.trim().length || icon === 'spinner pi-spin'}
                    onClick={searchForExpenses} />
            </div>
            {
                expenses.length > 0 &&
                <div className="m-0">
                    <DataTable value={expenses} size="small" tableStyle={{ fontSize: '15px', cursor: 'pointer' }} >
                        <Column field="date" header="Date" body={row => formatShortDate(new Date(row.date))} />
                        <Column field="purpose" header="Expenses"
                            headerTooltip={`Found ${expenses.length} Expenses`}
                            headerTooltipOptions={{ position: 'top' }} />
                        <Column field="amount" header="Amount" align='right' bodyStyle={{ textAlign: 'right' }}
                            body={row => formatRupee(row.amount)}
                            headerTooltip={`Total Amount ${toTotal(expenses)}`}
                            headerTooltipOptions={{ position: 'top' }} />
                    </DataTable>
                </div>
            }
        </div>
    );
}

export default SearchExpenses;