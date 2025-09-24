import { useEffect, useState } from "react";
import type { Day, TotalChangeEvent } from "../services/models";

import { Accordion, AccordionTab } from 'primereact/accordion';
import { Skeleton } from "primereact/skeleton";
import { getDaysOfMonth } from "../services/expenses";
import { addMissingDays, formatShortMonth, formatRupee } from "../services/utilities";
import ExpenseList from "./ExpenseList";

type Props = { today: Date, monthKey: string, onMonthTotalChange: (event: TotalChangeEvent) => void };

function DayList({ today, monthKey, onMonthTotalChange }: Props) {
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

    function onDayTotalChange(event: TotalChangeEvent) {
        const targetDay = days.find(day => day.key === event.key);
        if (!targetDay) throw new Error('No targetDay found for dayKey: ' + event.key);
        targetDay.total = event.total;
        setDays([...days]);
        onMonthTotalChange({
            key: monthKey,
            total: days.map(day => day.total).reduce((a, b) => a + b, 0)
        });
    }

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
                            <ExpenseList dayKey={day.key as string}
                                onDayTotalChange={onDayTotalChange} />
                        </div>
                    </AccordionTab>
                ))
            }</Accordion>
    );
}

export default DayList;