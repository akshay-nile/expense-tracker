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
