import { useEffect, useState } from "react";
import type { Expense } from "../services/models";

import { Skeleton } from "primereact/skeleton";
import { getExpensesOfDay } from "../services/expenses";
import { Button } from "primereact/button";

type Props = { dayKey: string };

function ExpenseList({ dayKey }: Props) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getExpensesOfDay(dayKey);
                setExpenses(data);
            }
            catch (error) { console.error(error); }
            finally { setLoading(false); }
        })();
    }, [dayKey]);

    return (
        loading
            ? <Skeleton height="3.2rem"></Skeleton>
            : <div className="w-full flex flex-col font-normal m-0 p-0">
                {
                    expenses.length === 0
                        ? <div className="text-center">Zero Expenditure</div>
                        : expenses.map(exp => (
                            <div key={exp.timestamp} className="flex m-0 my-1.5 gap-2">
                                <input type="text" placeholder="Purpose" value={exp.purpose} readOnly
                                    className="w-full p-0 px-2 m-0 rounded-sm text-[15px] flex-6"
                                    onChange={e => { exp.purpose = e.target.value; setExpenses([...expenses]); }} />

                                <input type="number" placeholder="Amount" value={exp.amount} readOnly
                                    className="w-full p-0 px-2 m-0 rounded-sm text-[15px] flex-2"
                                    onChange={e => { exp.amount = parseInt(e.target.value.trim() || '0'); setExpenses([...expenses]); }} />

                                <Button icon="pi pi-minus" rounded outlined aria-label="Delete" className="text-xs" />
                            </div>
                        ))
                }
                <div className="w-full flex justify-center items-center mt-2 mb-1 gap-2">
                    <Button icon="pi pi-pencil" rounded outlined aria-label="Edit" className="text-xs" />
                    <Button icon="pi pi-plus" rounded outlined aria-label="Add" className="text-xs" />
                    <Button icon="pi pi-save" rounded outlined aria-label="Save" className="text-xs" />
                    <Button icon="pi pi-times" rounded outlined aria-label="Cancel" className="text-xs" />
                </div>
            </div >
    );
}

export default ExpenseList;