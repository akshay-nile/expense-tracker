import { useEffect } from 'react';
import useCurrentDate from './custom-hooks/useCurrentDate';
import { formatLongDate } from './services/utilities';
import YearList from './components/YearList';

function App() {
  const today = useCurrentDate();

  useEffect(() => { }, []);

  return (
    <div className="flex flex-col items-stretch">
      <div className="text-center text-2xl font-light tracking-wider m-4 mt-8">
        {formatLongDate(today)}
      </div>

      <div className="m-4">
        <YearList today={today} />
      </div>
    </div >
  );
};

export default App;
