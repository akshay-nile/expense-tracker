import { BreadCrumb } from 'primereact/breadcrumb';
import { Button } from 'primereact/button';
import type { MenuItem } from 'primereact/menuitem';
import { useCallback, useState } from 'react';
import { utils, writeFile } from 'xlsx';
import YearList from './components/YearList';
import useCurrentDate from './custom-hooks/useCurrentDate';
import useCurrentTime from './custom-hooks/useCurrentTime';
import { getAllExpensesForExport } from './services/expenses';
import type { DailyExpense, Theme } from './services/models';
import { formatISODate, formatLongDate, formatLongMonth, formatRupee, formatTime, weekdays } from './services/utilities';

const THEME_KEY = 'expense-tracker-theme';
type Props = { setAppTheme: (theme: Theme) => void };

function App({ setAppTheme }: Props) {
  const today = useCurrentDate();
  const time = useCurrentTime();
  const theme = localStorage.getItem(THEME_KEY) as Theme;

  const [exporting, setExporting] = useState<boolean>(false);
  const [breadCrumbItems, setBreadCrumbItems] = useState<MenuItem[]>([]);
  const [isLightTheme, setIsLightTheme] = useState<boolean>(theme ? theme === 'light' : false);

  const onUpdateBreadCrumb = useCallback((key: string) => {
    const splits = key.split('/');
    const items: MenuItem[] = [];
    if (splits.length < 2) { setBreadCrumbItems([]); return; }
    if (splits.length >= 2) items.push({ label: 'Year ' + splits[1] });
    if (splits.length >= 3) items.push({ label: formatLongMonth(splits[2]) });
    if (splits.length >= 4) items.push({ label: 'Day ' + parseInt(splits[3]) });
    if (splits.length >= 5) items.push({ label: splits[4] });
    setBreadCrumbItems(items);
  }, []);

  function toggleTheme(theme: boolean) {
    setAppTheme(theme ? 'light' : 'dark');
    setIsLightTheme(theme);
  }

  async function exportAllToExcelSheet() {
    setExporting(true);
    const data = await getAllExpensesForExport();

    const worksheets = data.reduce((sheets, row) => {
      row.total = formatRupee(row.total as number);
      const year = row.date.split("-")[0];
      if (!sheets.has(year)) sheets.set(year, []);
      sheets.get(year)?.push(row);
      return sheets;
    }, new Map<string, DailyExpense[]>());

    const workbook = utils.book_new();
    for (const [year, expenses] of worksheets) {
      const worksheet = utils.json_to_sheet(expenses, { header: ['date', 'purpose', 'total'] });
      utils.sheet_add_aoa(worksheet, [['Date', 'Purpose', 'Total']], { origin: "A1" });
      utils.book_append_sheet(workbook, worksheet, 'Year ' + year);
    }

    const filename = `Daily Expenses ${formatISODate(today)}.xlsx`;
    writeFile(workbook, filename);
    setExporting(false);
  }

  async function goToToday() { }

  return (
    <div className="flex justify-center">
      <div className="w-full sm:w-2/5">

        <div className="flex justify-between items-center mt-4">
          <div className="flex flex-col font-light ms-3" onClick={goToToday}>
            <div className="flex">
              <div className="text-2xl cursor-pointer">
                {weekdays[today.getDay()]}
              </div>
              <div className="w-full text-sm text-center self-end">
                {formatTime(time)}
              </div>
            </div>
            <div className="text-xl self-start cursor-pointer">
              {formatLongDate(today)}
            </div>
          </div>

          <div className="flex">
            <div className="me-3.5">
              <Button icon="pi pi-mobile" outlined tooltip='Install as PWA'
                size='large' style={{ width: '2.5rem', height: '2.5rem', padding: '0rem' }}
              />
            </div>
            <div className="me-3.5">
              <Button icon={`pi ${exporting ? 'pi-spin pi-spinner' : 'pi-file-export'}`} outlined
                size='large' style={{ width: '2.5rem', height: '2.5rem', padding: '0rem' }}
                onClick={exportAllToExcelSheet} disabled={exporting} tooltip='Export to Excel' />
            </div>
            <div className="me-2.5">
              <Button icon={isLightTheme ? 'pi pi-moon' : 'pi pi-sun'} outlined tooltip='Toggle Theme'
                size='large' style={{ width: '2.5rem', height: '2.5rem', padding: '0rem' }}
                onClick={() => toggleTheme(!isLightTheme)} />
            </div>
          </div>
        </div>

        <div className="my-4 mb-5 mx-2.5 p-0">
          <BreadCrumb model={breadCrumbItems} home={{ icon: 'pi pi-home' }}
            style={{ fontWeight: '350', fontSize: '0.99rem' }} />
        </div>

        <div className="my-4 mx-2.5">
          <YearList today={today}
            onUpdateBreadCrumb={onUpdateBreadCrumb} />
        </div>

      </div>
    </div>

  );
};

export default App;
