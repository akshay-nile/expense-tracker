
export interface Year {
    year: string;
    total: number;
}

export interface Month {
    month: string;
    total: number;
}

export interface Day {
    day: string;
    total: number;
}

export interface Expense {
    timestamp: number;
    purpose: string;
    amount: number;
}