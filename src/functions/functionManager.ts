import { Function } from "./function";
import { Abs } from "./num/abs";
import { Clock } from "./sys/clock";

export class FunctionManager {
    private static instance: FunctionManager;
    private functions: Map<string, Function> = new Map();

    private constructor() {
        this.registFunction(new Clock());
        this.registFunction(new Abs());
    }

    public static getInstance(): FunctionManager {
        if (!FunctionManager.instance) {
            FunctionManager.instance = new FunctionManager();
        }
        return FunctionManager.instance;
    }

    public getFunction(name: string): Function | undefined {
        return this.functions.get(name);
    }

    public registFunction(func: Function): void {
        const name = func.getName();
        this.functions.set(name, func);
    }

    public removeFunction(name: string): void {
        this.functions.delete(name);
    }

    public getAllFunctions(): Function[] {
        return Array.from(this.functions.values());
    }

    public getFunctionsByGroup(group: string): Function[] {
        return this.getAllFunctions().filter(f => f.getGroup() === group);
    }
}