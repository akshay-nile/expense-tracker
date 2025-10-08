import { useEffect, useState } from 'react';
import type { Month, TotalChangeEvent } from '../services/models';

import { Accordion, AccordionTab } from 'primereact/accordion';
import { Skeleton } from 'primereact/skeleton';
import { getMonthsOfYear } from '../services/expenses';
import { addMissingMonths, breadCrumbUpdater, formatLongMonth, formatRupee, monthSkeletonLength } from '../services/utilities';
import DayList from './DayList';

type Props = {
    today: Date,
    yearKey: string,
    jumpTrigger: boolean,
    onYearTotalChange: (event: TotalChangeEvent) => void
};

function MonthList({ today, jumpTrigger, yearKey, onYearTotalChange }: Props) {
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
        const total = months.map(month => month.total).reduce((a, b) => a + b, 0);
        onYearTotalChange({ key: yearKey, total });
    }

    function updateBreadCrumb(index: number) {
        setActiveIndex(index);
        breadCrumbUpdater(index === null ? yearKey : months[index - 1]?.key as string);
    }

    useEffect(() => {
        if (!jumpTrigger) return;
        if (months.length > 0) {
            setActiveIndex(today.getMonth() + 1);
            setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 500);
        }
    }, [jumpTrigger, months, today]);

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
                                    jumpTrigger={jumpTrigger}
                                    onMonthTotalChange={onMonthTotalChange} />
                            </div>
                        </AccordionTab>
                    ))
                }</Accordion>
    );
}

export default MonthList;