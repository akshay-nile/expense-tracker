import { useEffect, useState } from "react";
import type { Month, TotalChangeEvent } from "../services/models";

import { Accordion, AccordionTab } from 'primereact/accordion';
import { Skeleton } from "primereact/skeleton";
import { getMonthsOfYear } from "../services/expenses";
import { addMissingMonths, formatLongMonth, formatRupee, monthSkeletonLength } from "../services/utilities";
import DayList from "./DayList";

type Props = {
    today: Date,
    yearKey: string,
    onUpdateBreadCrumb: (key: string) => void,
    onYearTotalChange: (event: TotalChangeEvent) => void
};

function MonthList({ today, yearKey, onYearTotalChange, onUpdateBreadCrumb }: Props) {
    const [months, setMonths] = useState<Month[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getMonthsOfYear(yearKey);
                addMissingMonths(data, today, yearKey);
                data.forEach(month => month.key = `${yearKey}/${month.month}`);
                setMonths(data);
            }
            catch (error) { console.error(error); }
            finally { setLoading(false); }
        })();
    }, [today, yearKey]);

    function onMonthTotalChange(event: TotalChangeEvent) {
        const targetMonth = months.find(month => month.key === event.key);
        if (!targetMonth) throw new Error('No targetMonth found for monthKey: ' + event.key);
        targetMonth.total = event.total;
        setMonths([...months]);
        onYearTotalChange({
            key: yearKey,
            total: months.map(month => month.total).reduce((a, b) => a + b, 0)
        });
    }

    function updateBreadCrumb(index: number) {
        setActiveIndex(index);
        onUpdateBreadCrumb(index === null ? yearKey : months[index - 1].key as string);
    }

    return (
        loading
            ? Array.from(monthSkeletonLength(today, yearKey), (_, i: number) =>
                (<Skeleton key={i} height="3.5rem" className="my-1" />))
            : <Accordion activeIndex={activeIndex}
                onTabChange={e => updateBreadCrumb(e.index as number)}> {
                    months.map(month => (
                        <AccordionTab key={month.key} header={
                            <div className="w-full flex justify-between font-semibold">
                                <div>{formatLongMonth(month.month)}</div>
                                <div>{formatRupee(month.total)}</div>
                            </div>
                        }>
                            <div>
                                <DayList today={today} monthKey={month.key as string}
                                    onMonthTotalChange={onMonthTotalChange}
                                    onUpdateBreadCrumb={onUpdateBreadCrumb} />
                            </div>
                        </AccordionTab>
                    ))
                }</Accordion>
    );
}

export default MonthList;