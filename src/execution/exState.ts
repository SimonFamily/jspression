export class ExState {
    static readonly OK = new ExState(0);
    static readonly ERROR = new ExState(1);

    private static _mappings: Map<number, ExState> = new Map();

    private constructor(public readonly value: number) {
        ExState._mappings.set(value, this);
    }

    getValue(): number {
        return this.value;
    }

    static forValue(value: number): ExState | undefined {
        return ExState._mappings.get(value);
    }

    // 可选：添加 toString 方法便于调试
    toString(): string {
        switch (this.value) {
            case 0: return "OK";
            case 1: return "ERROR";
            default: return `Unknown ExState (${this.value})`;
        }
    }
}

// 初始化映射
ExState.OK;
ExState.ERROR;