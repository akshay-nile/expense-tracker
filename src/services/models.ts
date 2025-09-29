
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

export interface PostResult {
    inserted: number,
    updated: number,
    deleted: number
}

export interface TotalChangeEvent {
    key: string,
    total: number
}

export interface MonthReport {
    day: string;
    purpose: string;
    total: number;
}

export interface YearReport {
    month: string;
    purpose: string;
    total: number;
}

export type Theme = 'light' | 'dark';

// Define the type globally
export interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
    prompt(): Promise<void>;
}

// Optional: add a property to window to store the event
declare global {
    interface Window {
        deferredPrompt?: BeforeInstallPromptEvent;
    }
}
