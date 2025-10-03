import { useEffect, useState } from "react";
import type { Category } from "../../services/models";

import { Chip } from "primereact/chip";
import { ListBox } from "primereact/listbox";
import { MeterGroup } from 'primereact/metergroup';
import { ProgressSpinner } from "primereact/progressspinner";
import { getReportOfCategories } from "../../services/expenses";
import { formatRupee } from "../../services/utilities";

type Props = { reportKey: string, actualTotal: number };

function CategorizedReport({ reportKey, actualTotal }: Props) {
    const [loading, setLoading] = useState<boolean>(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selections, setSelections] = useState<Category[]>([]);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getReportOfCategories(reportKey);
                setCategories(data);
            }
            catch (error) { console.error(error); }
            finally { setLoading(false); }
        })();
    }, [reportKey]);

    function getItemTemplate(category: Category) {
        return (
            <div className="flex justify-between items-center">
                <span className="flex-2">
                    <Chip label={category.category} style={{ fontSize: 'smaller', borderRadius: '0.4rem' }} />
                </span>
                <div className="flex flex-col flex-1">
                    <span className="flex text-sm justify-between mb-0.5">
                        <span>{Math.round(100 * category.total / actualTotal)}%</span>
                        <span>{formatRupee(category.total)}</span>
                    </span>
                    <MeterGroup values={[{ value: category.total }]} max={actualTotal} />
                </div>
            </div>
        );
    }

    return (
        loading
            ? <ProgressSpinner strokeWidth="0.15rem" animationDuration="0.5s" aria-label="Loading Categories"
                style={{ width: '100%', height: '5rem', marginTop: '1%' }} />
            : <div className="p-3 pt-2">
                <div className={`text-lg text-center tracking-wider font-semibold mb-3 ${categories.length < 2 ? 'hidden' : ''}`}>
                    {formatRupee(selections.map(c => c.total).reduce((a, b) => a + b, 0))}
                    <div className="text-xs tracking-normal font-light mt-0.2">
                        {selections.length === 0 ? 'No Catergory Selected' : `Total of ${selections.length} Selected Categories`}
                    </div>
                </div>
                <ListBox multiple itemTemplate={c => getItemTemplate(c)}
                    options={categories} optionLabel="category"
                    value={selections} onChange={e => setSelections(e.value)} />
            </div>
    );
}

export default CategorizedReport;