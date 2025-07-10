import { Tracer } from "../../tracer";
import { BitSet } from "../../util/bitSet";
import { ByteBuffer } from "../../util/byteBuffer";
import { Value } from "../../values/value";
import { OpCode } from "../opCode";
import { Chunk } from "./chunk";
import { ConstantPool } from "./constantPool";

export class ChunkReader {
    private codeBuffer: ByteBuffer;
    private constPool: ConstantPool;
    private isVarConst: BitSet;
    private tracer: Tracer;

    constructor(chunk: Chunk, tracer: Tracer) {
        this.tracer = tracer;
        
        // 初始化字节码缓冲区
        this.codeBuffer = new ByteBuffer(chunk.codes.length);
        this.codeBuffer.putBytes(chunk.codes);
        this.codeBuffer.newPosition(0); // 重置位置到起始处
        
        // 初始化常量池
        this.constPool = new ConstantPool(chunk.constants, tracer);
        
        // 初始化变量常量标记位集
        this.isVarConst = BitSet.valueOf(chunk.vars);
    }

    readByte(): number {
        return this.codeBuffer.get();
    }

    readShort(): number {
        return this.codeBuffer.getShort();
    }

    readInt(): number {
        return this.codeBuffer.getInt();
    }

    readOpCode(): OpCode {
        const code = this.readByte();
        return OpCode.forValue(code);
    }

    readConst(index: number): Value {
        return this.constPool.readConst(index);
    }

    getVariables(): string[] {
        this.tracer.startTimer()
        const values = this.constPool.getAllConsts();
        const result: string[] = [];
        
        for (let i = 0; i < values.length; i++) {
            if (this.isVarConst.get(i)) {
                result.push(values[i].toString());
            }
        }
        this.tracer.endTimer("构造变量列表")
        return result;
    }

    position(): number {
        return this.codeBuffer.position;
    }

    newPosition(newPos: number): void {
        if (newPos < 0 || newPos > this.codeSize()) {
            throw new Error(`Invalid position: ${newPos}`);
        }
        this.codeBuffer.position = newPos;
    }

    codeSize(): number {
        return this.codeBuffer.bufferLength;
    }

    remaining(): number {
        return this.codeBuffer.remaining();
    }
}