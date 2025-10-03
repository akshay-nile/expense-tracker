import { useEffect, useState } from "react";
import type { Expense, TotalChangeEvent } from "../services/models";

import { ProgressSpinner } from "primereact/progressspinner";
import { getExpensesOfDay } from "../services/expenses";
import { formatRupee } from "../services/utilities";
import ExpenseListEditor from "./ExpenseListEditor";

type Props = {
    dayKey: string,
    jumpTrigger: boolean,
    onDayTotalChange: (event: TotalChangeEvent) => void
};

function ExpenseList({ dayKey, jumpTrigger, onDayTotalChange }: Props) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getExpensesOfDay(dayKey);
                shiftMiscsAtLast(data);
                setExpenses(data);
            }
            catch (error) { console.error(error); }
            finally { setLoading(false); }
        })();
    }, [dayKey]);

    function onSave(savedExpenses: Expense[]) {
        const total = savedExpenses.map(expense => expense.amount).reduce((a, b) => a + b, 0);
        onDayTotalChange({ key: dayKey, total });
        shiftMiscsAtLast(savedExpenses);
        setExpenses(savedExpenses);
        setEditMode(false);
    }

    function shiftMiscsAtLast(expenses: Expense[]) {
        const miscsIndex = expenses.findIndex(e => e.purpose.toLocaleLowerCase() === 'miscs');
        if (miscsIndex !== -1) {
            const miscs = expenses[miscsIndex];
            expenses.splice(miscsIndex, 1);
            expenses.push(miscs);
        }
    }

    useEffect(() => {
        if (!jumpTrigger) return;
        setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 1000);
    }, [jumpTrigger]);

    return (
        loading
            ? <ProgressSpinner style={{ width: '100%', height: '3em' }} strokeWidth="0.3em" animationDuration="0.5s" aria-label="Loading" />
            : editMode
                ? <ExpenseListEditor dayKey={dayKey} expenses={expenses} onSave={onSave} onCancel={() => setEditMode(false)} />
                : <div className="w-full flex flex-col font-normal m-0 p-0">
                    {
                        expenses.length === 0
                            ? <div className="text-center my-3 text-lg cursor-pointer"
                                onClick={() => !editMode && setEditMode(true)}>No Expenses</div>
                            : expenses.map(expense => (
                                <div key={expense.timestamp} className="flex m-0 my-2 gap-1 text-[16px] mx-2">
                                    <input type="text" placeholder="Purpose" className="w-full p-0 px-2 m-0 rounded-sm flex-6"
                                        value={expense.purpose} readOnly
                                        onClick={() => setEditMode(true)} />

                                    <input type="text" placeholder="Amount" className="w-full p-0 px-2 m-0 rounded-sm text-right flex-2"
                                        readOnly value={formatRupee(expense.amount)}
                                        onClick={() => setEditMode(true)} />
                                </div>
                            ))
                    }
                </div >
    );
}

export default ExpenseList;