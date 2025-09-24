import type { MenuItem } from 'primereact/menuitem';
import YearList from './components/YearList';
import useCurrentDate from './custom-hooks/useCurrentDate';
import useCurrentTime from './custom-hooks/useCurrentTime';
import { formatLongDate, formatLongMonth, formatTime, weekdays } from './services/utilities';
import { BreadCrumb } from 'primereact/breadcrumb';
import { useCallback, useState } from 'react';

function App() {
  const today = useCurrentDate();
  const time = useCurrentTime();

  const [breadCrumbItems, setBreadCrumbItems] = useState<MenuItem[]>([]);

  const updateBreadCrumb = useCallback((key: string) => {
    const splits = key.split('/');
    const items: MenuItem[] = [];
    if (splits.length < 2) {
      setBreadCrumbItems([]);
      return;
    }
    if (splits.length >= 2) items.push({ label: 'Year ' + splits[1] });
    if (splits.length >= 3) items.push({ label: formatLongMonth(splits[2]) });
    if (splits.length >= 4) items.push({ label: 'Day ' + parseInt(splits[3]) });
    if (splits.length >= 5) items.push({ label: splits[4] });
    setBreadCrumbItems(items);
  }, []);

  return (
    <div className="flex justify-center">
      <div className="w-full sm:w-2/5">

        <div className="w-full font-light tracking-wider mt-6 px-1">
          <div className="flex justify-between items-center mx-3">
            <div className="text-2xl text-gray-200">{weekdays[today.getDay()]}</div>
            <div className="text-sm self-start">{formatTime(time)}</div>
          </div>
          <div className="text-xl mx-3">{formatLongDate(today)}</div>
        </div>

        <div className="my-4 mb-5 mx-2.25">
          <BreadCrumb model={breadCrumbItems} home={{ icon: 'pi pi-home' }} style={{ fontSize: '15px' }} />
        </div>

        <div className="my-4 mx-2.25">
          <YearList today={today} onUpdateBreadCrumb={updateBreadCrumb} />
        </div>

      </div>
    </div>

  );
};

export default App;
