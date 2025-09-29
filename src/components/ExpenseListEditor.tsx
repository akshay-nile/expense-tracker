import { useRef, useState } from "react";
import type { EditExpense, Expense } from "../services/models";

import { Button } from "primereact/button";
import { postExpensesOfDay } from "../services/expenses";
import { toastMessage } from "../services/utilities";

type Props = {
    dayKey: string,
    expenses: Expense[],
    onCancel: () => void
    onSave: (expenses: Expense[]) => void,
};

function ExpenseListEditor({ dayKey, expenses, onSave, onCancel }: Props) {
    const toTotal = (a: string) => a.split('+').map(s => parseInt(s)).reduce((a, b) => a + b, 0);
    const toEditExpense = (e: Expense) => ({ ...e, amount: e.amount.toString() } as EditExpense);
    const toExpense = (e: EditExpense) => ({ ...e, amount: toTotal(e.amount) || 0 } as Expense);
    const notParsable = (a: string) => a.split('+').map(s => s.trim()).some(n => n.length === 0 || isNaN(Number(n)) || parseInt(n) <= 0);
    const notUnique = (pa: string[]) => new Set(pa.map(s => s.trim().toLowerCase())).size !== pa.length;

    const lastInputRef = useRef<HTMLInputElement>(null);

    const [editExpenses, setEditExpenses] = useState<EditExpense[]>(expenses.map(toEditExpense));
    const [saving, setSaving] = useState<boolean>(false);
    const [invalid, setInvalid] = useState<boolean>(false);

    function isInvalidEditExpense(expense: EditExpense): boolean {
        if (expense.timestamp === 0) return true;
        if (expense.purpose.includes(',')) return true;
        if (expense.purpose.trim().length === 0) return true;
        if (notParsable(expense.amount)) return true;
        return false;
    }

    function editPurpose(value: string, timestamp: number) {
        const editExpense = findEditExpense(timestamp);
        editExpense.purpose = value;
        setEditExpenses([...editExpenses]);
        setInvalid(isInvalidEditExpense(editExpense));
    }

    function editAmount(value: string, timestamp: number) {
        const editExpense = findEditExpense(timestamp);
        editExpense.amount = value;
        setEditExpenses([...editExpenses]);
        setInvalid(isInvalidEditExpense(editExpense));
    }

    function addNewEditExpense() {
        const newEditExpense = { timestamp: Date.now(), purpose: 'Miscs', amount: '' };
        setEditExpenses([...editExpenses, newEditExpense]);
        setInvalid(true);
        setTimeout(() => lastInputRef.current?.focus(), 0);
    }

    function deleteEditExpense(timestamp: number) {
        const activeEditExpenses = editExpenses.filter(edtExp => edtExp.timestamp !== timestamp);
        setEditExpenses(activeEditExpenses);
        setInvalid(activeEditExpenses.some(isInvalidEditExpense));
    }

    function findEditExpense(timestamp: number): EditExpense {
        const editExpense = editExpenses.find(edtExp => edtExp.timestamp === timestamp);
        if (!editExpense) throw new Error('No EditExpense found for the timestamp: ' + timestamp);
        return editExpense;
    }

    async function saveEditExpenses() {
        if (editExpenses.some(isInvalidEditExpense)) {
            console.error('Invalid Expense Found:', editExpenses);
            toastMessage.show({
                severity: 'error', summary: 'Invalid Expense!',
                detail: 'Some expense is unacceptable and cannot be saved'
            });
            setInvalid(true);
            return;
        }
        const purposes = editExpenses.map(expense => expense.purpose);
        if (notUnique(purposes)) {
            console.error('Duplicate Purpose Found:', purposes);
            toastMessage.show({
                severity: 'error', summary: 'Duplicate Purpose!',
                detail: 'All the expenses should have unique Purpose fields'
            });
            setInvalid(true);
            return;
        }
        setSaving(true);
        editExpenses.forEach(expenses => expenses.purpose = expenses.purpose.trim());
        const expensesToSave = editExpenses.map(toExpense);
        const status = await postExpensesOfDay(expensesToSave, dayKey);
        toastMessage.show({
            severity: 'success', summary: 'Expenses Saved!',
            detail: `Added: ${status?.inserted} Updated: ${status?.updated} Deleted: ${status?.deleted}`
        });
        onSave(expensesToSave);
    }

    return (
        <div className="w-full flex flex-col font-normal m-0 p-0">
            {
                editExpenses.length === 0
                    ? <div className="text-center my-3 text-lg cursor-pointer">No Expenses</div>
                    : editExpenses.map(expense => (
                        <div key={expense.timestamp} className="flex m-0 my-2 gap-1 text-[16px] mx-0">
                            <input type="text" placeholder="Purpose" className="w-full p-0 px-2 m-0 rounded-sm flex-6"
                                value={expense.purpose} onChange={e => editPurpose(e.target.value, expense.timestamp)} />

                            <input type="tel" placeholder="Amount" className="w-full p-0 px-2 m-0 rounded-sm text-right flex-2"
                                value={expense.amount} onChange={e => editAmount(e.target.value, expense.timestamp)}
                                ref={lastInputRef} />

                            <Button icon="pi pi-minus" outlined className="text-xs"
                                disabled={saving} tooltip="Delete" tooltipOptions={{ position: 'left' }}
                                onClick={() => deleteEditExpense(expense.timestamp)} />
                        </div>
                    ))
            }
            <div className="w-full flex justify-between items-center mt-2 mb-1">
                <div className="flex gap-3 mx-1">
                    <Button outlined className="text-xs"
                        tooltip="Save" tooltipOptions={{ position: 'right' }}
                        icon={`pi ${saving ? 'pi-spin pi-spinner' : 'pi-save'}`}
                        disabled={invalid || saving}
                        onClick={() => saveEditExpenses()} />
                    <Button icon="pi pi-times" outlined className="text-xs"
                        tooltip="Cancel" tooltipOptions={{ position: 'right' }}
                        onClick={() => onCancel()} />
                </div>
                <div className="m-0">
                    <Button icon="pi pi-plus" outlined className="text-xs"
                        tooltip="Add" tooltipOptions={{ position: 'left' }}
                        disabled={invalid || saving}
                        onClick={() => addNewEditExpense()} />
                </div>
            </div>
        </div >
    );
}

export default ExpenseListEditor;