import { useEffect, useState } from "react";
import type { Category } from "../services/models";

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { ProgressSpinner } from "primereact/progressspinner";
import { getReportOfCategories } from "../services/expenses";
import { formatRupee } from "../services/utilities";

type Props = { reportKey: string };

function CategoriesReport({ reportKey }: Props) {
    const [loading, setLoading] = useState<boolean>(false);
    const [categories, setCategories] = useState<Category[]>([]);

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

    return (
        loading
            ? <ProgressSpinner strokeWidth="0.15rem" animationDuration="0.5s" aria-label="Loading Report"
                style={{ width: '100%', height: '5rem', marginTop: '1%' }} />
            : <DataTable value={categories} showGridlines size="small" tableStyle={{ fontSize: '14px' }} >
                <Column field="category" header="Category" align="center" bodyStyle={{ textAlign: 'left' }} />
                <Column field="total" header="Total" align="center" bodyStyle={{ textAlign: 'center' }}
                    body={row => formatRupee(row.total)} />
            </DataTable>
    );
}

export default CategoriesReport;