import { BreadCrumb } from 'primereact/breadcrumb';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import type { MenuItem } from 'primereact/menuitem';
import { Toast } from 'primereact/toast';
import { useCallback, useRef, useState } from 'react';
import MonthExpenseReport from './components/reports/MonthExpenseReport';
import YearExpenseReport from './components/reports/YearExpenseReport';
import YearList from './components/YearList';
import useCurrentDate from './custom-hooks/useCurrentDate';
import useCurrentTime from './custom-hooks/useCurrentTime';
import usePWAInstaller from './custom-hooks/usePWAInstaller';
import { getAllExpensesForExport } from './services/expenses';
import type { BeforeInstallPromptEvent, DailyExpense, Theme } from './services/models';
import { formatISODate, formatLongDate, formatLongMonth, formatRupee, formatTime, registerToastRef, setBreadCrumbUpdater, toastMessage, weekdays } from './services/utilities';
import SearchExpenses from './components/SearchExpenses';

const THEME_KEY = 'expense-tracker-theme';
type Props = { setAppTheme: (theme: Theme) => void };

function App({ setAppTheme }: Props) {
  const today = useCurrentDate();
  const time = useCurrentTime();
  const [isInstalled, installPrompt] = usePWAInstaller('expense-tacker-pwa');

  const theme = localStorage.getItem(THEME_KEY) as Theme;
  const keyBackupRef = useRef<string>('');

  const [exporting, setExporting] = useState<boolean>(false);
  const [breadCrumbItems, setBreadCrumbItems] = useState<MenuItem[]>([]);
  const [isLightTheme, setIsLightTheme] = useState<boolean>(theme ? theme === 'light' : false);
  const [jumpTrigger, setJumpTrigger] = useState<boolean>(false);
  const [reportKey, setReportKey] = useState<string | null>(null);

  function showPWAInstallPrompt() {
    if (!installPrompt) {
      toastMessage.show({
        severity: 'warn', summary: 'Browser Approval Pending',
        detail: 'PWA installation is not approved by the browser yet'
      });
      return;
    }
    (installPrompt as BeforeInstallPromptEvent).prompt();
  }

  const showYearReport = useCallback((splits: string[]) => {
    const yearKey = `/${splits[1]}`;
    setReportKey(yearKey);
    keyBackupRef.current = splits.join('/');
    setBreadCrumbItems([{ label: `Expense Report of Year ${splits[1]}` }]);
  }, []);

  const showMonthReport = useCallback((splits: string[]) => {
    const monthKey = `/${splits[1]}/${splits[2]}`;
    setReportKey(monthKey);
    keyBackupRef.current = splits.join('/');
    setBreadCrumbItems([{ label: `Expense Report of ${formatLongMonth(splits[2])} ${splits[1]}` }]);
  }, []);

  function closeReport() {
    if (reportKey === null) return;
    setReportKey(null);
    updateBreadCrumb(keyBackupRef.current);
    keyBackupRef.current = '';
  }

  const updateBreadCrumb = useCallback((key: string) => {
    const splits = key.split('/');
    const items: MenuItem[] = [];
    if (splits.length < 2) { setBreadCrumbItems([]); return; }
    if (splits.length >= 2) items.push({ label: 'Year ' + splits[1], command: () => showYearReport(splits) });
    if (splits.length >= 3) items.push({ label: formatLongMonth(splits[2]), command: () => showMonthReport(splits) });
    if (splits.length >= 4) items.push({ label: `Day ${parseInt(splits[3])}` });
    setBreadCrumbItems(items);
  }, [showMonthReport, showYearReport]);

  function jumpToToday() {
    if (jumpTrigger) return;
    if (reportKey !== null) closeReport();
    setJumpTrigger(true);
    setTimeout(() => setJumpTrigger(false), 1000);
    updateBreadCrumb('/' + formatISODate(today).replaceAll('-', '/'));
  }

  function toggleAppTheme() {
    const newIsLightTheme = !isLightTheme;
    setAppTheme(newIsLightTheme ? 'light' : 'dark');
    setIsLightTheme(newIsLightTheme);
    toastMessage.show({ severity: 'info', summary: `${newIsLightTheme ? 'Light' : 'Dark'} Theme Applied` });
  }

  async function exportAllToExcelSheet() {
    setExporting(true);
    const { utils, writeFile } = await import('xlsx');
    const data = await getAllExpensesForExport();

    const worksheets = data.reduce((sheets, row) => {
      row.total = formatRupee(row.total as number);
      const year = row.date.split('-')[0];
      if (!sheets.has(year)) sheets.set(year, []);
      sheets.get(year)?.push(row);
      return sheets;
    }, new Map<string, DailyExpense[]>());

    const workbook = utils.book_new();
    for (const [year, expenses] of worksheets) {
      const worksheet = utils.json_to_sheet(expenses, { header: ['date', 'purpose', 'total'] });
      utils.sheet_add_aoa(worksheet, [['Date', 'Purpose', 'Total']], { origin: 'A1' });
      utils.book_append_sheet(workbook, worksheet, 'Year ' + year);
    }

    const filename = `Expenses Until ${formatISODate(today)}.xlsx`;
    writeFile(workbook, filename);
    setExporting(false);
    toastMessage.show({
      severity: 'success', summary: 'Exported Successfully',
      detail: 'Excel file is ready for the download'
    });
  }

  return (
    <div className="flex justify-center">
      <div className="w-full sm:w-2/5">

        <div className='sticky-top'>
          <div className="flex justify-between items-center">
            <div className="flex flex-col font-light ms-3 cursor-pointer" onClick={jumpToToday}>
              <div className="flex">
                <div className="text-2xl">{weekdays[today.getDay()]}</div>
                <div className="ms-2 text-sm self-end font-normal">{formatTime(time)}</div>
              </div>
              <div className="text-xl self-start">{formatLongDate(today)}</div>
            </div>

            <div className="flex">
              <div className={`me-3.5 ${isInstalled ? 'hidden' : ''}`}>
                <Button icon="pi pi-mobile" outlined
                  tooltip='Install as PWA' tooltipOptions={{ position: 'left' }}
                  size='large' style={{ width: '2.5rem', height: '2.5rem', padding: '0rem' }}
                  onClick={showPWAInstallPrompt} />
              </div>
              <div className="me-3.5">
                <Button icon={`pi ${exporting ? 'pi-spin pi-spinner' : 'pi-file-export'}`} outlined
                  size='large' style={{ width: '2.5rem', height: '2.5rem', padding: '0rem' }}
                  tooltip='Export to Excel' tooltipOptions={{ position: 'left' }}
                  onClick={exportAllToExcelSheet} disabled={exporting} />
              </div>
              <div className="me-2.5">
                <Button icon={isLightTheme ? 'pi pi-moon' : 'pi pi-sun'} outlined
                  size='large' style={{ width: '2.5rem', height: '2.5rem', padding: '0rem' }}
                  tooltip={`${isLightTheme ? 'Dark' : 'Light'} Theme`} tooltipOptions={{ position: 'left' }}
                  onClick={toggleAppTheme} />
              </div>
            </div>
          </div>

          <div className="mt-4 mx-2.5">
            <BreadCrumb model={breadCrumbItems}
              home={{
                icon: `pi ${reportKey !== null ? 'pi-times' : (jumpTrigger ? 'pi-spin pi-spinner' : 'pi-home')}`,
                command: () => closeReport()
              }}
              style={{ fontWeight: '350', fontSize: '0.99rem' }}
              ref={() => { setBreadCrumbUpdater(updateBreadCrumb); }} />
          </div>
        </div>

        <div className={`mb-4 mx-2.5 ${reportKey !== null ? 'hidden' : ''}`}>
          <YearList today={today} jumpTrigger={jumpTrigger} />
        </div>

        {
          reportKey !== null &&
          <div className="mb-4 mx-3">
            {
              reportKey.split('/').length === 2
                ? <YearExpenseReport today={today} yearKey={reportKey} />
                : <MonthExpenseReport today={today} monthKey={reportKey} />
            }
          </div>
        }

        <div className={`my-4 mx-2.5 ${reportKey !== null ? 'hidden' : ''}`}>
          <SearchExpenses />
        </div>

        <Toast ref={(toast: Toast) => { registerToastRef(toast); }} position="center" />
        <ConfirmDialog />

      </div>
    </div>

  );
};

export default App;
