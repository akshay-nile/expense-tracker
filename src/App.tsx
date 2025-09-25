import { BreadCrumb } from 'primereact/breadcrumb';
import { Button } from 'primereact/button';
import type { MenuItem } from 'primereact/menuitem';
import { useCallback, useState } from 'react';
import YearList from './components/YearList';
import useCurrentDate from './custom-hooks/useCurrentDate';
import useCurrentTime from './custom-hooks/useCurrentTime';
import type { Theme } from './services/models';
import { formatLongDate, formatLongMonth, formatTime, weekdays } from './services/utilities';

const THEME_KEY = 'expense-tracker-theme';
type Props = { setAppTheme: (theme: 'light' | 'dark') => void };

function App({ setAppTheme }: Props) {
  const today = useCurrentDate();
  const time = useCurrentTime();
  const theme = localStorage.getItem(THEME_KEY) as Theme;

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

  return (
    <div className="flex justify-center">
      <div className="w-full sm:w-2/5">

        <div className="w-full font-light tracking-wider mt-6 px-1">
          <div className="flex justify-between items-center mx-3">
            <div className="text-2xl cursor-pointer" onClick={() => { }}>
              {weekdays[today.getDay()]}
            </div>
            <div className="text-sm self-start">{formatTime(time)}</div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-xl mx-3 cursor-pointer" onClick={() => { }}>
              {formatLongDate(today)}
            </div>
            <div className="mx-4 my-0 mb-1">
              <Button outlined aria-label="Toggle Theme" className="text-xs"
                icon={isLightTheme ? 'pi pi-moon' : 'pi pi-sun'}
                onClick={() => toggleTheme(!isLightTheme)} />
            </div>
          </div>
        </div>

        <div className="my-4 mb-5 mx-2.25 p-0">
          <BreadCrumb model={breadCrumbItems} home={{ icon: 'pi pi-home' }}
            style={{
              fontWeight: '350', height: '3em',
              fontSize: breadCrumbItems.length > 2 ? '14px' : '15px',
              padding: breadCrumbItems.length > 2 ? '0.8em' : '1.2em'
            }} />
        </div>

        <div className="my-4 mx-2.25">
          <YearList today={today}
            onUpdateBreadCrumb={onUpdateBreadCrumb} />
        </div>

      </div>
    </div>

  );
};

export default App;
