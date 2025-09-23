import { useEffect } from 'react';
import useCurrentDate from './custom-hooks/useCurrentDate';
import { formatLongDate } from './services/utilities';

function App() {
  const today = useCurrentDate();

  useEffect(() => { }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="text-2xl font-light tracking-wider mt-5">
        {formatLongDate(today)}
      </div>
    </div >
  );
};

export default App;
