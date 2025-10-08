import { useState, useEffect } from 'react';

export default function useCurrentDate() {
    const [today, setToday] = useState(new Date());

    useEffect(() => {
        // To calculate ms until midnight
        const getMsUntilMidnight = () => {
            const now = today;
            const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1,
                0, 0, 0, 0
            );
            return tomorrow.getTime() - now.getTime();
        };

        // Schedule the next update at next midnight
        const timeout = setTimeout(() => setToday(new Date()), getMsUntilMidnight());

        return () => clearTimeout(timeout);
    }, [today]); // re-run effect after updating today every midnight

    return today;
}
