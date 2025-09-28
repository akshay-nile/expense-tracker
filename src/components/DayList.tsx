import { useCallback, useEffect, useState } from "react";
import type { Day, TotalChangeEvent } from "../services/models";

import { Accordion, AccordionTab } from 'primereact/accordion';
import { Skeleton } from "primereact/skeleton";
import { getDaysOfMonth } from "../services/expenses";
import { dayListReady } from "../services/intercom";
import { addMissingDays, daySkeletonLength, formatRupee, formatShortMonth } from "../services/utilities";
import ExpenseList from "./ExpenseList";

type Props = {
    today: Date,
    monthKey: string,
    onUpdateBreadCrumb: (key: string) => void,
    onMonthTotalChange: (event: TotalChangeEvent) => void
};

function DayList({ today, monthKey, onMonthTotalChange, onUpdateBreadCrumb }: Props) {
    const [days, setDays] = useState<Day[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

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
        const total = days.map(day => day.total).reduce((a, b) => a + b, 0);
        onMonthTotalChange({ key: monthKey, total });
    }

    const updateBreadCrumb = useCallback((index: number) => {
        setActiveIndex(index);
        onUpdateBreadCrumb(index === null ? '' : days[index - 1]?.key as string);
    }, [days, onUpdateBreadCrumb]);

    useEffect(() => {
        if (days.length > 0) dayListReady.register(() => updateBreadCrumb(days.length));
    }, [days, updateBreadCrumb]);

    return (
        loading
            ? Array.from(daySkeletonLength(today, monthKey), (_, i: number) =>
                (<Skeleton key={i} height="3.5rem" className="my-1" />))
            : <Accordion activeIndex={activeIndex}
                onTabChange={e => updateBreadCrumb(e.index as number)}> {
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