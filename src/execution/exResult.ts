import { ExState } from './exState';
import { Value } from '../values/value';

export class ExResult {
    private state: ExState;
    private value: Value | null;
    private index: number = 0;
    private error: string | null = null;

    constructor(value: Value | null, state: ExState) {
        this.value = value;
        this.state = state;
    }

    getState(): ExState {
        return this.state;
    }

    setState(state: ExState): void {
        this.state = state;
    }

    getResult(): Value | null {
        return this.value;
    }

    setResult(value: Value | null): void {
        this.value = value;
    }

    getIndex(): number {
        return this.index;
    }

    setIndex(index: number): void {
        this.index = index;
    }

    getError(): string | null {
        return this.error;
    }

    setError(error: string): void {
        this.error = error;
    }
    
    // 辅助方法：创建成功结果
    static success(value: Value): ExResult {
        return new ExResult(value, ExState.OK);
    }
    
    // 辅助方法：创建错误结果
    static error(error: string, index: number = 0): ExResult {
        const result = new ExResult(null, ExState.ERROR);
        result.setError(error);
        result.setIndex(index);
        return result;
    }
}