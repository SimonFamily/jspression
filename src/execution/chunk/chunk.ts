import { ByteBuffer } from "../../util/byteBuffer";

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

    toBytes(): Uint8Array {
        const sz = this.getByteSize() + 3 * 4
        const buf = new ByteBuffer(sz)
        buf.putInt(this.getCodesSize())
        buf.putBytes(this.codes)
        buf.putInt(this.getConstsSize())
        buf.putBytes(this.constants)
        buf.putInt(this.getVarsSize())
        buf.putBytes(this.vars)
        return buf.toBytes()
    }

    static valueOf(bytes: Uint8Array): Chunk {
        const buf = ByteBuffer.fromBytes(bytes)
        buf.newPosition(0)
        const codeSz = buf.getInt()
        const codes = buf.getBytes(codeSz)
        const constSz = buf.getInt()
        const consts = buf.getBytes(constSz)
        const varSz = buf.getInt()
        const vars = buf.getBytes(varSz)
        return new Chunk(codes, consts, vars)
    }
}