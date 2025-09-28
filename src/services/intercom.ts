import type { Toast } from "primereact/toast";

type Func = () => void;
type Resolver = (func: Func) => void;

interface ReadyState {
    promise: Promise<Func>;
    register: Resolver;
    reset: Func;
}

function createReadyState(): ReadyState {
    let resolver: Resolver | null = null;
    let promise: Promise<Func> = new Promise((resolve) => resolver = resolve);
    return {
        promise,
        register(func: Func) { if (resolver) resolver(func); },
        reset() {
            resolver = null;
            promise = new Promise((resolve) => resolver = resolve);
        }
    };
}

export const yearListReady = createReadyState();
export const monthListReady = createReadyState();
export const dayListReady = createReadyState();
export const expenseListReady = createReadyState();

export let toastMessage: Toast;
export const registerToastRef = (toastRef: Toast) => toastMessage = toastRef;