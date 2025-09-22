const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const rupeeFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
});

export function formatRupee(amount: number): string {
    return rupeeFormatter.format(amount);
}

export function formatISODate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export function formatLongDate(date: Date): string {
    const weekDay = weekdays[date.getDay()];
    const day = String(date.getDate()).padStart(2, "0");
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    return `${weekDay}, ${day} ${monthName}, ${year}`;
}

export function formatLongMonth(month: string): string {
    const index = parseInt(month) - 1;
    return months[index];
}

export function formatShortMonth(month: string): string {
    return formatLongMonth(month).substring(0, 3);
}

type NodeChild = { year?: string, month?: string, day?: string, total: number };

export function addMissingItems(data: Array<NodeChild>, currentDate: Date, key: 'year' | 'month' | 'day', itemKey: string = '') {
    let startFrom = Math.min(...data.map(d => parseInt(d.year as string)));
    let endAt = currentDate.getFullYear();

    if (key === 'day') {
        startFrom = 1;
        const itemYear = parseInt(itemKey.split('/')[1]);
        const itemMonth = parseInt(itemKey.split('/')[2]);
        const lastDay = new Date(itemYear, itemMonth, 0).getDate();
        if ((currentDate.getMonth() + 1) === itemMonth) endAt = currentDate.getDate();
        else endAt = lastDay;
    } else if (key === 'month') {
        startFrom = 1;
        const itemYear = parseInt(itemKey.split('/')[1]);
        const lastMonth = new Date(itemYear, 0, 0).getMonth() + 1;
        if (currentDate.getFullYear() === itemYear) endAt = currentDate.getMonth() + 1;
        else endAt = lastMonth;
    }

    for (let item = startFrom; item <= endAt; item++) {
        const label = new String(item).padStart(2, '0');
        if (data.find(d => d[key] === label)) continue;
        data.push({ [key]: label, total: 0 });
    }
    data.sort((a, b) => parseInt(a[key] as string) - parseInt(b[key] as string));
}
