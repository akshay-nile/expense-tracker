let baseURL = import.meta.env.VITE_BASE_URL as string;

type NodeChild = { year?: string, month?: string, day?: string, total: number };
// type ExpenseChild = { timestamp: number, purpose: string, amount: number };

export async function getExpenses(path = ''): Promise<NodeChild[]> {
    try {
        const response = await fetch(`${baseURL}/expenses${path}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        if (import.meta.env.VITE_WIFI_URL) {
            baseURL = import.meta.env.VITE_WIFI_URL as string;
            return await getExpenses(path);
        }
    }
    return [];
}