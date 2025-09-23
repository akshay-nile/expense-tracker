import { useEffect, useState } from "react";
import type { Day } from "../services/models";

import { Accordion, AccordionTab } from 'primereact/accordion';
import { Skeleton } from "primereact/skeleton";
import { getDaysOfMonth } from "../services/expenses";
import { addMissingDays, formatShortMonth, formatRupee } from "../services/utilities";
import ExpenseList from "./ExpenseList";

type Props = { today: Date, monthKey: string };

function DayList({ today, monthKey }: Props) {
    const [days, setDays] = useState<Day[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getDaysOfMonth(monthKey);
                addMissingDays(data, today, monthKey);
                data.forEach(day => day.key = `${monthKey}/${day.day}`);
                setDays(data);
            }
            catch (error) { console.error(error); }
            finally { setLoading(false); }
        })();
    }, [today, monthKey]);

    return (
        loading
            ? <Skeleton height="3.3rem"></Skeleton>
            : <Accordion> {
                days.map(day => (
                    <AccordionTab key={day.key} header={
                        <div className="w-full flex justify-between font-medium">
                            <div>{day.day} {formatShortMonth(monthKey.split('/')[2])}</div>
                            <div>{formatRupee(day.total)}</div>
                        </div>
                    }>
                        <div>
                            <ExpenseList dayKey={day.key as string} />
                        </div>
                    </AccordionTab>
                ))
            }</Accordion>
    );
}

export default DayList;