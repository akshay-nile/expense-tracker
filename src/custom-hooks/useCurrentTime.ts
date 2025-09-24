import { useState, useEffect } from "react";

export default function useCurrentTime() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        // To calculate ms until next minute
        const getMsUntilNextMinute = () => {
            const currMinute = time;
            const nextMinute = new Date(time.getFullYear(), time.getMonth(), time.getDate(),
                time.getHours(), time.getMinutes() + 1, 0, 0
            );
            return nextMinute.getTime() - currMinute.getTime();
        };

        // Schedule the next update at next minute
        const timeout = setTimeout(() => setTime(new Date()), getMsUntilNextMinute());

        return () => clearTimeout(timeout);
    }, [time]); // re-run effect after updating time every minute

    return time;
}
