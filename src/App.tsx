import { useEffect } from 'react';
import useCurrentDate from './custom-hooks/useCurrentDate';
import { formatLongDate } from './services/utilities';

function App() {
  const today = useCurrentDate();

  useEffect(() => { }, []);

  return (
    <div className="d-flex flex-column">
      <div className="text-bold text-center m-5 text-lg">
        {formatLongDate(today)}
      </div>
    </div >
  );
};

export default App;
