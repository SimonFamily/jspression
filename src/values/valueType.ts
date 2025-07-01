export class ValueType {
    static readonly Integer = new ValueType(1);
    static readonly Long = new ValueType(2);
    static readonly Float = new ValueType(3);
    static readonly Double = new ValueType(4);
    static readonly String = new ValueType(5);
    static readonly Boolean = new ValueType(6);
    static readonly Instance = new ValueType(7);
    static readonly Null = new ValueType(8);

    private static _mappings: Map<number, ValueType> = new Map();

    private constructor(public readonly value: number) {
        ValueType._mappings.set(value, this);
    }

    getValue(): number {
        return this.value;
    }

    static valueOf(value: number): ValueType | undefined {
        return ValueType._mappings.get(value);
    }

    toString(): string {
        switch (this.value) {
            case 1: return "Integer";
            case 2: return "Long";
            case 3: return "Float";
            case 4: return "Double";
            case 5: return "String";
            case 6: return "Boolean";
            case 7: return "Instance";
            case 8: return "Null";
            default: return `Unknown ValueType (${this.value})`;
        }
    }
}

// 初始化映射表（确保所有值类型被注册）
ValueType.Integer;
ValueType.Long;
ValueType.Float;
ValueType.Double;
ValueType.String;
ValueType.Boolean;
ValueType.Instance;
ValueType.Null;