import { useEffect, useState } from "react";
import type { Expense } from "../services/models";

import { Skeleton } from "primereact/skeleton";
import { getExpensesOfDay } from "../services/expenses";
import { formatRupee } from "../services/utilities";

type Props = { dayKey: string };

function ExpenseList({ dayKey }: Props) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getExpensesOfDay(dayKey);
                data.forEach(exp => exp.key = `${dayKey}/${exp.timestamp}`);
                setExpenses(data);
            }
            catch (error) { console.error(error); }
            finally { setLoading(false); }
        })();
    }, [dayKey]);

    return (
        loading
            ? <Skeleton height="3.2rem"></Skeleton>
            : <div className="w-full flex flex-col font-normal gap-3">{
                expenses.length === 0
                    ? <div className="text-center">Zero Expenditure</div>
                    : expenses.map(exp => (
                        <div key={exp.key} className="flex justify-between mx-10">
                            <div>{exp.purpose.trim()}</div>
                            <div>{formatRupee(exp.amount)}</div>
                        </div>
                    ))
            }</div>
    );
}

export default ExpenseList;