import type { Day, Month, Year } from "./models";

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

export function addMissingYears(data: Array<Year>, today: Date) {
    const startFrom = Math.min(...data.map(d => parseInt(d.year)));
    const endAt = today.getFullYear();

    for (let item = startFrom; item <= endAt; item++) {
        const label = String(item);
        if (data.find(d => d.year === label)) continue;
        data.push({ year: label, total: 0 });
    }

    data.sort((a, b) => parseInt(a.year) - parseInt(b.year));
}

export function addMissingMonths(data: Array<Month>, today: Date, yearKey: string) {
    const startFrom = 1;
    let endAt = today.getMonth() + 1;

    const itemYear = parseInt(yearKey.split('/')[1]);
    const lastMonth = new Date(itemYear, 0, 0).getMonth() + 1;

    if (today.getFullYear() !== itemYear) endAt = lastMonth;

    for (let item = startFrom; item <= endAt; item++) {
        const label = new String(item).padStart(2, '0');
        if (data.find(d => d.month === label)) continue;
        data.push({ month: label, total: 0 });
    }

    data.sort((a, b) => parseInt(a.month) - parseInt(b.month));
}

export function addMissingDays(data: Array<Day>, today: Date, monthKey: string) {
    const startFrom = 1;
    let endAt = today.getDate();

    const itemYear = parseInt(monthKey.split('/')[1]);
    const itemMonth = parseInt(monthKey.split('/')[2]);
    const lastDay = new Date(itemYear, itemMonth, 0).getDate();

    if ((today.getMonth() + 1) !== itemMonth) endAt = lastDay;

    for (let item = startFrom; item <= endAt; item++) {
        const label = new String(item).padStart(2, '0');
        if (data.find(d => d.day === label)) continue;
        data.push({ day: label, total: 0 });
    }

    data.sort((a, b) => parseInt(a.day) - parseInt(b.day));
}