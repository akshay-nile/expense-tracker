import { type Day, type Expense, type Month, type PostResult, type Year } from './models';

let baseURL = import.meta.env.VITE_BASE_URL as string;
let retryCount = 2;

async function _fetch(path: string): Promise<[]> {
    try {
        const response = await fetch(`${baseURL}/expenses${path}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        if (import.meta.env.VITE_WIFI_URL && retryCount-- > 0) {
            baseURL = import.meta.env.VITE_WIFI_URL as string;
            return await _fetch(path);
        }
    }
    return [];
}

export async function getYears(): Promise<Year[]> {
    return await _fetch('');
}

export async function getMonthsOfYear(yearKey: string): Promise<Month[]> {
    return await _fetch(yearKey);
}

export async function getDaysOfMonth(monthKey: string): Promise<Day[]> {
    return await _fetch(monthKey);
}

export async function getExpensesOfDay(dayKey: string): Promise<Expense[]> {
    return await _fetch(dayKey);
}

export async function postExpensesOfDay(expenses: Expense[], dayKey: string): Promise<PostResult | null> {
    try {
        const response = await fetch(`${baseURL}/expenses${dayKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expenses)
        });
        return await response.json();
    } catch (error) { console.error(error); }
    return null;
}