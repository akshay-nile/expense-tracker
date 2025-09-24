import YearList from './components/YearList';
import useCurrentDate from './custom-hooks/useCurrentDate';
import useCurrentTime from './custom-hooks/useCurrentTime';
import { formatLongDate, formatTime, weekdays } from './services/utilities';

function App() {
  const today = useCurrentDate();
  const time = useCurrentTime();

  return (
    <div className="flex justify-center">
      <div className="w-full sm:w-2/5">

        <div className="w-full font-light tracking-wider my-6 px-1">
          <div className="flex justify-between items-center mx-3">
            <div className="text-2xl text-gray-200">{weekdays[today.getDay()]}</div>
            <div className="text-sm self-start">{formatTime(time)}</div>
          </div>
          <div className="text-xl mx-3">{formatLongDate(today)}</div>
        </div>

        <div className="mt-4 mx-2">
          <YearList today={today} />
        </div>

      </div>
    </div>

  );
};

export default App;
