import { type Category, type DailyExpense, type Day, type Expense, type Month, type MonthReport, type PostResult, type SearchedExpense, type Year, type YearReport } from './models';

async function tryToFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
    try {
        const response = await fetch('/expenses' + path, init);
        if (response.status === 401) {
            sessionStorage.setItem('initiator-url', window.location.href);
            window.location.href = '/projects/browser-authenticator/index.html';
        }
        return await (response as Response).json() as T;
    } catch (error) {
        console.error(error);
        return {} as T;
    }
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

export async function getGuessedPurposes(amount: number): Promise<string[]> {
    return await tryToFetch('?amount=' + amount);
}

export async function postExpensesOfDay(expenses: Expense[], dayKey: string): Promise<PostResult | null> {
    try {
        return await tryToFetch(dayKey, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expenses)
        });
    } catch (error) { console.error(error); return null; }
}