export class OpCode {
    static readonly OP_CONSTANT = new OpCode(0, "constant");
    static readonly OP_NULL = new OpCode(1, "null");
    static readonly OP_TRUE = new OpCode(2, "true");
    static readonly OP_FALSE = new OpCode(3, "false");
    static readonly OP_POP = new OpCode(4, "pop");
    static readonly OP_GET_LOCAL = new OpCode(5, "get_local");
    static readonly OP_SET_LOCAL = new OpCode(6, "set_local");
    static readonly OP_GET_GLOBAL = new OpCode(7, "get_global");
    static readonly OP_DEFINE_GLOBAL = new OpCode(8, "define_global");
    static readonly OP_SET_GLOBAL = new OpCode(9, "set_global");
    static readonly OP_GET_PROPERTY = new OpCode(10, "get_property");
    static readonly OP_SET_PROPERTY = new OpCode(11, "set_property");
    static readonly OP_EQUAL_EQUAL = new OpCode(12, "==");
    static readonly OP_BANG_EQUAL = new OpCode(13, "!=");
    static readonly OP_GREATER = new OpCode(14, ">");
    static readonly OP_GREATER_EQUAL = new OpCode(15, ">=");
    static readonly OP_LESS = new OpCode(16, "<");
    static readonly OP_LESS_EQUAL = new OpCode(17, "<=");
    static readonly OP_ADD = new OpCode(18, "+");
    static readonly OP_SUBTRACT = new OpCode(19, "-");
    static readonly OP_MULTIPLY = new OpCode(20, "*");
    static readonly OP_DIVIDE = new OpCode(21, "/");
    static readonly OP_MODE = new OpCode(22, "%");
    static readonly OP_POWER = new OpCode(23, "**");
    static readonly OP_NOT = new OpCode(24, "!");
    static readonly OP_NEGATE = new OpCode(25, "-");
    static readonly OP_JUMP = new OpCode(26, "jump");
    static readonly OP_JUMP_IF_FALSE = new OpCode(27, "jump_if_false");
    static readonly OP_CALL = new OpCode(28, "call");
    static readonly OP_BEGIN = new OpCode(29, "begin");
    static readonly OP_END = new OpCode(30, "end");
    static readonly OP_RETURN = new OpCode(31, "return");
    static readonly OP_EXIT = new OpCode(32, "exit");

    private static _mappings: Map<number, OpCode> = new Map();

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

// 初始化映射表（确保所有操作码被注册）
OpCode.OP_CONSTANT;
OpCode.OP_NULL;
OpCode.OP_TRUE;
OpCode.OP_FALSE;
OpCode.OP_POP;
OpCode.OP_GET_LOCAL;
OpCode.OP_SET_LOCAL;
OpCode.OP_GET_GLOBAL;
OpCode.OP_DEFINE_GLOBAL;
OpCode.OP_SET_GLOBAL;
OpCode.OP_GET_PROPERTY;
OpCode.OP_SET_PROPERTY;
OpCode.OP_EQUAL_EQUAL;
OpCode.OP_BANG_EQUAL;
OpCode.OP_GREATER;
OpCode.OP_GREATER_EQUAL;
OpCode.OP_LESS;
OpCode.OP_LESS_EQUAL;
OpCode.OP_ADD;
OpCode.OP_SUBTRACT;
OpCode.OP_MULTIPLY;
OpCode.OP_DIVIDE;
OpCode.OP_MODE;
OpCode.OP_POWER;
OpCode.OP_NOT;
OpCode.OP_NEGATE;
OpCode.OP_JUMP;
OpCode.OP_JUMP_IF_FALSE;
OpCode.OP_CALL;
OpCode.OP_BEGIN;
OpCode.OP_END;
OpCode.OP_RETURN;
OpCode.OP_EXIT;