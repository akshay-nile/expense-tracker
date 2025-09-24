import YearList from './components/YearList';
import useCurrentDate from './custom-hooks/useCurrentDate';
import { formatLongDate } from './services/utilities';

function App() {
  const today = useCurrentDate();

  return (
    <div className="flex justify-center">
      <div className="w-full sm:w-2/5">
        <div className="text-center text-2xl font-light tracking-wider my-8">
          {formatLongDate(today)}
        </div>
        <div className="m-2">
          <YearList today={today} />
        </div>
      </div>
    </div>
  );
};

export default App;
