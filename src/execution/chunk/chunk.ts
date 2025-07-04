export class Chunk {
    codes: Uint8Array;     // 字节码
    constants: Uint8Array; // 常量池
    vars: Uint8Array;      // 变量信息

    constructor();
    constructor(codes: Uint8Array, constants: Uint8Array, vars: Uint8Array);
    constructor(codes?: Uint8Array, constants?: Uint8Array, vars?: Uint8Array) {
        this.codes = codes || new Uint8Array(0);
        this.constants = constants || new Uint8Array(0);
        this.vars = vars || new Uint8Array(0);
    }

    getByteSize(): number {
        return this.codes.length + this.constants.length + this.vars.length;
    }

    getCodesSize(): number {
        return this.codes.length;
    }

    getConstsSize(): number {
        return this.constants.length;
    }

    getVarsSize(): number {
        return this.vars.length;
    }
}