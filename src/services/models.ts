
export interface Year {
    key?: string;
    year: string;
    total: number;
}

export interface Month {
    key?: string;
    month: string;
    total: number;
}

export interface Day {
    key?: string;
    day: string;
    total: number;
}

export interface Expense {
    key?: string;
    timestamp: number;
    purpose: string;
    amount: number;
}

export interface EditExpense {
    key?: string;
    timestamp: number;
    purpose: string;
    amount: string;
}

export interface DailyExpense {
    date: string;
    purpose: string;
    total: number | string;
}

export interface MonthReport {
    day: string;
    purpose: string;
    total: number;
}

export interface MonthReportData {
    actualTotal: number;
    estimatedTotal: number;
    days: Array<MonthReport>;
    dayCount: number;
}

export interface PostResult {
    inserted: number,
    updated: number,
    deleted: number
}

export interface TotalChangeEvent {
    key: string,
    total: number
}

export type Theme = 'light' | 'dark';