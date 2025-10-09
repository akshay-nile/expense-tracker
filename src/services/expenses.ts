import { type Category, type DailyExpense, type Day, type Expense, type Month, type MonthReport, type PostResult, type SearchedExpense, type Year, type YearReport } from './models';

let baseURL = import.meta.env.VITE_BASE_URL as string;
let retryCount = 2;

// This wrapper function is used as an interceptor that inserts X-Browser-ID header in each request
async function fetchWithBrowserId(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response | void> {
    const redirectURL = '/projects/browser-authenticator/index.html';
    const browserId = localStorage.getItem('browser-id');
    const isProd = input.toString().startsWith('https');

    if (isProd && !browserId) {
        localStorage.setItem('initiator-url', window.location.href);
        window.location.href = redirectURL;
        return;
    }

    const headers = new Headers(init.headers || {});
    if (browserId) headers.set('X-Browser-ID', browserId);

    const response = await fetch(input, { ...init, headers });
    if (response.status === 400 || response.status === 401) {
        localStorage.setItem('initiator-url', window.location.href);
        window.location.href = redirectURL;
        return;
    }

    return response;
}

async function tryToFetch<T>(path: string): Promise<T> {
    try {
        const response = await fetchWithBrowserId(`${baseURL}/expenses${path}`);
        return await (response as Response).json();
    } catch (error) {
        console.error(error);
        if (import.meta.env.VITE_WIFI_URL && retryCount-- > 0) {
            baseURL = import.meta.env.VITE_WIFI_URL as string;
            return await tryToFetch(path);
        }
    }
    return [] as T;
}

export async function getYears(): Promise<Year[]> {
    return await tryToFetch('');
}

export async function getMonthsOfYear(yearKey: string): Promise<Month[]> {
    return await tryToFetch(yearKey);
}

export async function getDaysOfMonth(monthKey: string): Promise<Day[]> {
    return await tryToFetch(monthKey);
}

export async function getExpensesOfDay(dayKey: string): Promise<Expense[]> {
    return await tryToFetch(dayKey);
}

export async function getAllExpensesForExport(): Promise<DailyExpense[]> {
    return await tryToFetch('?export=true');
}

export async function getReportOfMonthExpenses(monthKey: string): Promise<MonthReport[]> {
    return await tryToFetch(monthKey + '?report=true');
}

export async function getReportOfYearExpenses(yearKey: string): Promise<YearReport[]> {
    return await tryToFetch(yearKey + '?report=true');
}

export async function getReportOfCategories(reportKey: string): Promise<Category[]> {
    return await tryToFetch(reportKey + '?categories=true');
}

export async function getSearchedExpenses(search: string): Promise<SearchedExpense[]> {
    return await tryToFetch('?search=' + search);
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