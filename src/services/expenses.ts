import { type DailyExpense, type Day, type Expense, type Month, type PostResult, type Year } from './models';

let baseURL = import.meta.env.VITE_BASE_URL as string;
let retryCount = 2;

// This wrapper function is used as an interceptor
async function fetchWithBrowserId(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response | void> {
    const redirectURL = '/projects/browser-authenticator/index.html';
    const browserId = localStorage.getItem("browser-id");
    const isProd = input.toString().startsWith('https');

    if (isProd && !browserId) {
        localStorage.setItem('initiator-url', window.location.href);
        window.location.href = redirectURL;
        return;
    }

    const headers = new Headers(init.headers || {});
    if (browserId) headers.set("X-Browser-ID", browserId);

    const response = await fetch(input, { ...init, headers });
    if (response.status === 400 || response.status === 401) {
        localStorage.setItem('initiator-url', window.location.href);
        window.location.href = redirectURL;
        return;
    }

    return response;
}

async function _fetch(path: string): Promise<[]> {
    try {
        const response = await fetchWithBrowserId(`${baseURL}/expenses${path}`);
        return await (response as Response).json();
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

export async function getAllExpensesForExport(): Promise<DailyExpense[]> {
    return await _fetch('?export=true');
}

export async function postExpensesOfDay(expenses: Expense[], dayKey: string): Promise<PostResult | null> {
    try {
        const response = await fetchWithBrowserId(`${baseURL}/expenses${dayKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expenses)
        });
        return await (response as Response).json();
    } catch (error) { console.error(error); }
    return null;
}