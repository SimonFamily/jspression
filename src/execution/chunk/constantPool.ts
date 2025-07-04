import { JpCompileError } from "../../jpCompileError";
import { Tracer } from "../../tracer";
import { ByteBuffer } from "../../util/byteBuffer";
import { Value } from "../../values/value";
import { ValueType } from "../../values/valueType";

export class ConstantPool {
    private constants: Value[] = [];
    private indexMap: Map<string, number> = new Map();
    private tracer: Tracer;

    constructor(tracer: Tracer);
    constructor(capacity: number, tracer: Tracer);
    constructor(bytes: Uint8Array, tracer: Tracer);
    constructor(arg1: number | Uint8Array | Tracer, tracer?: Tracer) {
        if (typeof arg1 === 'number') {
            this.tracer = tracer!;
            this.constants = new Array(Math.max(arg1, 10));
        } else if (arg1 instanceof Uint8Array) {
            this.tracer = tracer!;
            this.tracer.startTimer();
            const buffer = new ByteBuffer(arg1.length);
            buffer.putBytes(arg1);
            buffer.newPosition(0);
            
            while (buffer.remaining() > 0) {
                const value = Value.getFrom(buffer);
                this.constants.push(value);
            }
            this.tracer.endTimer("根据字节数组构造常量池。");
        } else {
            this.tracer = arg1;
            this.constants = [];
        }
    }

    toBytes(): Uint8Array {
        this.tracer.startTimer();
        const buffer = new ByteBuffer(this.constants.length * 8); // 初始分配大小
        
        for (const value of this.constants) {
            value.writeTo(buffer);
        }
        
        const bytes = buffer.toBytes();
        this.tracer.endTimer("常量池生成字节数组。");
        return bytes;
    }

    addConst(value: Value): number {
        const strRep = value.toString();
        const existingIndex = this.indexMap.get(strRep);
        if (existingIndex !== undefined) {
            return existingIndex;
        }
        
        this.checkType(value);
        const index = this.constants.length;
        this.constants.push(value);
        this.indexMap.set(strRep, index);
        return index;
    }

    readConst(index: number): Value {
        if (index < 0 || index >= this.constants.length) {
            throw new Error(`Invalid constant index: ${index}`);
        }
        return this.constants[index];
    }

    getConstIndex(constant: string): number | null {
        const index = this.indexMap.get(constant);
        return index !== undefined ? index : null;
    }

    getAllConsts(): Value[] {
        return [...this.constants]; // 返回副本
    }

    clear(): void {
        this.constants = [];
        this.indexMap.clear();
    }

    private checkType(value: Value): void {
        const type = value.getValueType();
        switch (type) {
            case ValueType.Integer:
            case ValueType.Long:
            case ValueType.Float:
            case ValueType.Double:
            case ValueType.String:
            case ValueType.Boolean:
                break;
            default:
                throw new JpCompileError(0, `常量池中暂不支持此类型：${type}`);
        }
    }
}