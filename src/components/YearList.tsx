import { useEffect, useState } from 'react';
import type { TotalChangeEvent, Year } from '../services/models';

import { Accordion, AccordionTab } from 'primereact/accordion';
import { Skeleton } from 'primereact/skeleton';
import { getYears } from '../services/expenses';
import { addMissingYears, breadCrumbUpdater, formatRupee, yearSkeletonLength } from '../services/utilities';
import MonthList from './MonthList';

type Props = { today: Date, jumpTrigger: boolean };

function YearList({ today, jumpTrigger }: Props) {
    const [years, setYears] = useState<Year[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getYears();
                addMissingYears(data, today);
                data.forEach(year => year.key = `/${year.year}`);
                setYears(data);
            }
            catch (error) { console.error(error); }
            finally { setLoading(false); }
        })();
    }, [today]);

    function onYearTotalChange(event: TotalChangeEvent) {
        const targetYear = years.find(year => year.key === event.key);
        if (!targetYear) throw new Error('No targetYear found for yearKey: ' + event.key);
        targetYear.total = event.total;
        setYears([...years]);
    }

    function updateBreadCrumb(index: number) {
        setActiveIndex(index);
        breadCrumbUpdater(index === null ? '' : years[index - 1]?.key as string);
    }

    useEffect(() => {
        if (!jumpTrigger) return;
        if (years.length > 0) {
            setActiveIndex(today.getFullYear() - 2025 + 1);
            setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 250);
        }
    }, [jumpTrigger, years, today]);

    return (
        loading
            ? Array.from(yearSkeletonLength(today), (_, i: number) =>
                (<Skeleton key={i} height="3.5rem" className="my-1" />))
            : <Accordion activeIndex={activeIndex}
                onTabChange={e => updateBreadCrumb(e.index as number)}> {
                    years.map(year => (
                        <AccordionTab key={year.key} header={
                            <div className="w-full flex justify-between font-bold">
                                <div>{year.year}</div>
                                <div>{formatRupee(year.total)}</div>
                            </div>
                        }>
                            <div>
                                <MonthList today={today} yearKey={year.key as string}
                                    jumpTrigger={jumpTrigger}
                                    onYearTotalChange={onYearTotalChange} />
                            </div>
                        </AccordionTab>
                    ))
                }</Accordion>
    );
}

export default YearList;