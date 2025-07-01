import { Tracer } from "../../tracer";
import { BitSet } from "../../util/bitSet";
import { ByteBuffer } from "../../util/byteBuffer";
import { Value } from "../../values/value";
import { OpCode } from "../opCode";
import { Chunk } from "./chunk";
import { ConstantPool } from "./constantPool";

export class ChunkWriter {
    private codeBuffer: ByteBuffer;
    private constPool: ConstantPool;
    private isVarConst: BitSet;
    private tracer: Tracer;

    constructor(tracer: Tracer);
    constructor(capacity: number, tracer: Tracer);
    constructor(capacityOrTracer: number | Tracer, tracer?: Tracer) {
        if (typeof capacityOrTracer === 'number') {
            this.tracer = tracer!;
            this.codeBuffer = new ByteBuffer(Math.max(capacityOrTracer, 128));
        } else {
            this.tracer = capacityOrTracer;
            this.codeBuffer = new ByteBuffer(1024);
        }
        
        this.constPool = new ConstantPool(this.tracer);
        this.isVarConst = new BitSet();
    }

    flush(): Chunk {
        // 获取当前有效字节码
        const codeBytes = this.codeBuffer.toBytes();
        
        // 获取常量池字节数据
        const constBytes = this.constPool.toBytes();
        
        // 获取变量标记位集字节数据
        const varBytes = this.isVarConst.toByteArray();
        
        // 创建并返回新的块
        return new Chunk(codeBytes, constBytes, varBytes);
    }

    clear(): void {
        // 重置字节码缓冲区
        this.codeBuffer.clear();
        
        // 清空常量池
        this.constPool.clear();
        
        // 重置变量标记位集
        this.isVarConst = new BitSet();
    }

    writeByte(value: number): void {
        this.ensureCapacity(1);
        this.codeBuffer.put(value);
    }

    writeShort(value: number): void {
        this.ensureCapacity(2);
        this.codeBuffer.putShort(value);
    }

    writeInt(value: number): void {
        this.ensureCapacity(4);
        this.codeBuffer.putInt(value);
    }

    updateInt(index: number, value: number): void {
        if (index < 0 || index + 4 > this.codeBuffer.bufferLength) {
            throw new Error(`Index out of range: ${index}`);
        }
        this.codeBuffer.putIntAt(index, value);
    }

    writeCode(opCode: OpCode): void {
        this.writeByte(opCode.getValue());
    }

    addConstant(value: Value): number {
        return this.constPool.addConst(value);
    }

    setVariables(vars: string[]): void {
        // 初始化位集（大小足够容纳所有常量）
        const maxIndex = this.constPool.getAllConsts().length + vars.length;
        const byteLength = Math.ceil((maxIndex + 1) / 8);
        this.isVarConst = new BitSet(byteLength);
        
        // 处理每个变量
        for (const varName of vars) {
            // 查找或添加变量到常量池
            let index = this.constPool.getConstIndex(varName);
            if (index === null) {
                index = this.constPool.addConst(new Value(varName));
            }
            
            // 标记为变量
            this.isVarConst.set(index);
        }
    }

    position(): number {
        return this.codeBuffer.position;
    }

    private ensureCapacity(byteCount: number): void {
        if (this.codeBuffer.remaining() < byteCount) {
            this.grow();
        }
    }

    private grow(): void {
        // 计算新容量（翻倍）
        const newCapacity = this.codeBuffer.bufferLength * 2;
        
        // 创建新缓冲区
        const newBuffer = new ByteBuffer(newCapacity);
        
        // 复制现有数据
        newBuffer.putBytes(this.codeBuffer.toBytes());
        
        // 替换为新的缓冲区
        this.codeBuffer = newBuffer;
    }
}