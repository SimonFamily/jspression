export class OpCode {
    private static _mappings: Map<number, OpCode> = new Map();

    static readonly OP_CONSTANT = new OpCode(0, "OP_CONSTANT");
    static readonly OP_NULL = new OpCode(1, "OP_NULL");
    static readonly OP_TRUE = new OpCode(2, "OP_TRUE");
    static readonly OP_FALSE = new OpCode(3, "OP_FALSE");
    static readonly OP_POP = new OpCode(4, "OP_POP");
    static readonly OP_GET_LOCAL = new OpCode(5, "OP_GET_LOCAL");
    static readonly OP_SET_LOCAL = new OpCode(6, "OP_SET_LOCAL");
    static readonly OP_GET_GLOBAL = new OpCode(7, "OP_GET_GLOBAL");
    static readonly OP_DEFINE_GLOBAL = new OpCode(8, "OP_DEFINE_GLOBAL");
    static readonly OP_SET_GLOBAL = new OpCode(9, "OP_SET_GLOBAL");
    static readonly OP_GET_PROPERTY = new OpCode(10, "OP_GET_PROPERTY");
    static readonly OP_SET_PROPERTY = new OpCode(11, "OP_SET_PROPERTY");
    static readonly OP_EQUAL_EQUAL = new OpCode(12, "OP_EQUAL_EQUAL");
    static readonly OP_BANG_EQUAL = new OpCode(13, "OP_BANG_EQUAL");
    static readonly OP_GREATER = new OpCode(14, "OP_GREATER");
    static readonly OP_GREATER_EQUAL = new OpCode(15, "OP_GREATER_EQUAL");
    static readonly OP_LESS = new OpCode(16, "OP_LESS");
    static readonly OP_LESS_EQUAL = new OpCode(17, "OP_LESS_EQUAL");
    static readonly OP_ADD = new OpCode(18, "OP_ADD");
    static readonly OP_SUBTRACT = new OpCode(19, "OP_SUBTRACT");
    static readonly OP_MULTIPLY = new OpCode(20, "OP_MULTIPLY");
    static readonly OP_DIVIDE = new OpCode(21, "OP_DIVIDE");
    static readonly OP_MODE = new OpCode(22, "OP_MODE");
    static readonly OP_POWER = new OpCode(23, "OP_POWER");
    static readonly OP_NOT = new OpCode(24, "OP_NOT");
    static readonly OP_NEGATE = new OpCode(25, "OP_NEGATE");
    static readonly OP_JUMP = new OpCode(26, "OP_JUMP");
    static readonly OP_JUMP_IF_FALSE = new OpCode(27, "OP_JUMP_IF_FALSE");
    static readonly OP_CALL = new OpCode(28, "OP_CALL");
    static readonly OP_BEGIN = new OpCode(29, "OP_BEGIN");
    static readonly OP_END = new OpCode(30, "OP_END");
    static readonly OP_RETURN = new OpCode(31, "OP_RETURN");
    static readonly OP_EXIT = new OpCode(32, "OP_EXIT");

    private constructor(
        public readonly code: number,
        public readonly title: string
    ) {
        OpCode._mappings.set(code, this);
    }

    getValue(): number {
        return this.code;
    }

    getTitle(): string {
        return this.title;
    }

    static forValue(value: number): OpCode | undefined {
        return OpCode._mappings.get(value);
    }

    toString(): string {
        return `${this.title} (${this.code})`;
    }
}