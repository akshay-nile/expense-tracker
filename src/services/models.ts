
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