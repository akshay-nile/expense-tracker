import { useEffect, useState } from "react";
import type { TotalChangeEvent, Year } from "../services/models";

import { Accordion, AccordionTab } from 'primereact/accordion';
import { Skeleton } from "primereact/skeleton";
import { getYears } from "../services/expenses";
import { addMissingYears, formatRupee } from "../services/utilities";
import MonthList from "./MonthList";

type Props = { today: Date };

function YearList({ today }: Props) {
    const [years, setYears] = useState<Year[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

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

    return (
        loading
            ? <Skeleton height="3.5rem"></Skeleton>
            : <Accordion> {
                years.map(year => (
                    <AccordionTab key={year.key} header={
                        <div className="w-full flex justify-between font-bold">
                            <div>{year.year}</div>
                            <div>{formatRupee(year.total)}</div>
                        </div>
                    }>
                        <div>
                            <MonthList today={today} yearKey={year.key as string}
                                onYearTotalChange={onYearTotalChange} />
                        </div>
                    </AccordionTab>
                ))
            }</Accordion>
    );
}

export default YearList;