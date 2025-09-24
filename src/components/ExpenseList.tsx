import { useEffect, useState } from "react";
import type { Expense } from "../services/models";

import { Button } from "primereact/button";
import { Skeleton } from "primereact/skeleton";
import { getExpensesOfDay } from "../services/expenses";
import { formatRupee } from "../services/utilities";

type Props = { dayKey: string };

function ExpenseList({ dayKey }: Props) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [editInvalid, setEditInvalid] = useState<boolean>(false);
    const [editExpenses, setEditExpenses] = useState<Expense[]>([]);

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

    function setupEditMode() {
        expenses.forEach(expense => editExpenses.push({
            timestamp: expense.timestamp,
            purpose: expense.purpose,
            amount: expense.amount
        }));
        setEditExpenses([...editExpenses]);
        setEditMode(true);
    }

    function clearEditMode() {
        setEditExpenses([]);
        setEditMode(false);
        setEditInvalid(false);
    }

    function isValidExpense(expense: Expense): boolean {
        const purpose = expense.purpose.trim();
        const amount = Number(expense.amount);
        const isInvalid = expense.timestamp === 0 || purpose.length === 0 || isNaN(amount) || amount === 0;
        return isInvalid;
    }

    function editPurpose(value: string, timestamp: number) {
        const editExpense = findEditExpense(timestamp);
        editExpense.purpose = value;
        setEditExpenses([...editExpenses]);
        setEditInvalid(isValidExpense(editExpense));
    }

    function editAmount(value: string, timestamp: number) {
        const editExpense = findEditExpense(timestamp);
        editExpense.amount = parseInt(value);
        setEditExpenses([...editExpenses]);
        setEditInvalid(isValidExpense(editExpense));
    }

    function addNewExpense() {
        editExpenses.push({ timestamp: Date.now(), purpose: '', amount: 0 });
        setEditExpenses([...editExpenses]);
        setEditInvalid(true);
    }

    function deleteExpense(timestamp: number) {
        const activeEditExpenses = editExpenses.filter(edtExp => edtExp.timestamp !== timestamp);
        setEditExpenses(activeEditExpenses);
        setEditInvalid(editExpenses.some(isValidExpense));
    }

    function findEditExpense(timestamp: number): Expense {
        const editExpense = editExpenses.find(edtExp => edtExp.timestamp === timestamp);
        if (!editExpense) throw new Error('No editExpense found for the timestamp: ' + timestamp);
        return editExpense;
    }

    return (
        loading
            ? <Skeleton height="3.2rem"></Skeleton>
            : <div className="w-full flex flex-col font-normal m-0 p-0">
                {
                    (editMode ? editExpenses : expenses).length === 0
                        ? <div className="text-center my-2 text-lg text-gray-300"
                            onClick={() => !editMode && setupEditMode()}>No Expenses</div>
                        : (editMode ? editExpenses : expenses).map(expense => (
                            <div key={expense.timestamp} className={"flex m-0 my-2 gap-1 text-[16px] " + (editMode ? 'mx-0' : 'mx-2')}>
                                <input type="text" placeholder="Purpose" className="w-full p-0 px-2 m-0 rounded-sm flex-6"
                                    readOnly={!editMode}
                                    value={expense.purpose}
                                    onClick={() => !editMode && setupEditMode()}
                                    onChange={e => editPurpose(e.target.value, expense.timestamp)} />

                                <input type={editMode ? 'number' : 'text'} placeholder="Amount" className="w-full p-0 px-2 m-0 rounded-sm text-right flex-2"
                                    readOnly={!editMode}
                                    value={editMode ? expense.amount : formatRupee(expense.amount)}
                                    onClick={() => !editMode && setupEditMode()}
                                    onChange={e => editAmount(e.target.value, expense.timestamp)} />

                                {editMode && <Button icon="pi pi-minus" rounded outlined aria-label="Delete" className="text-xs"
                                    onClick={() => deleteExpense(expense.timestamp)} />}
                            </div>
                        ))
                }
                {
                    editMode &&
                    <div className="w-full flex justify-between items-center mt-2 mb-1">
                        <div className="flex gap-3 mx-1">
                            <Button icon="pi pi-save" rounded outlined aria-label="Save" className="text-xs"
                                disabled={editInvalid} />
                            <Button icon="pi pi-times" rounded outlined aria-label="Cancel" className="text-xs"
                                onClick={() => clearEditMode()} />
                        </div>
                        <div className="m-0">
                            <Button icon="pi pi-plus" rounded outlined aria-label="Add" className="text-xs"
                                disabled={editInvalid}
                                onClick={() => addNewExpense()} />
                        </div>
                    </div>
                }

            </div >
    );
}

export default ExpenseList;