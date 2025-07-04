import { Instance } from "../instance";
import { LoxException } from "../loxException";
import { ByteBuffer } from "../util/byteBuffer";
import { ValueType } from "./valueType";

export class Value {
    private v: number | string | boolean | Instance | null;
    private vt: number;

    constructor(v?: number | string | boolean | Instance, isInteger?: boolean) {
        if (v === undefined) {
            this.vt = ValueType.Null.value;
            this.v = null;
        } else if (typeof v === 'number') {
            if (Number.isNaN(v)) {
                throw new LoxException(0, "Cannot create Value from NaN");
            }
            if (!Number.isFinite(v)) {
                throw new LoxException(0, "Cannot create Value from Infinity or -Infinity");
            }
            // 大多数情况传递的数字是整数或浮点数程序可以自动判断，但对于7.0这种情况，js会将其视为整数
            // 所以需要根据isInteger参数来判断是否强制转换为小数；
            // 或者对于3.14这样的数字，也可通过这个参数来强制转换为整数
            if (isInteger === undefined) {
                if (Number.isInteger(v)) {
                    this.vt = ValueType.Integer.value;
                    this.v  = v;
                } else {
                    this.vt = ValueType.Double.value;
                    this.v = v;
                }
            } else {
                if (isInteger) {
                    this.v = Math.trunc(v);
                    this.vt = ValueType.Integer.value;
                } else {
                    this.v = v;
                    this.vt = ValueType.Double.value;
                }
            }
        } else if (typeof v === 'string') {
            this.v = v;
            this.vt = ValueType.String.value;
        } else if (typeof v === 'boolean') {
            this.v = v;
            this.vt = ValueType.Boolean.value;
        } else {
            this.v = v;
            this.vt = ValueType.Instance.value;
        }
    }

    static fromInt(v: number): Value {
        return new Value(v, true);
    }

    getValue(): number | string | boolean | Instance | null {
        return this.v;
    }

    getValueType(): ValueType | undefined {
        return ValueType.valueOf(this.vt);
    }

    static getFrom(buffer: ByteBuffer): Value {
        const tag = buffer.get();
        const type = ValueType.valueOf(tag);
        if (!type) throw new LoxException(0, `Unknown value type tag: ${tag}`);

        switch (type) {
            case ValueType.Integer:
                return new Value(buffer.getInt(), true);
            case ValueType.Double:
                return new Value(buffer.getDouble());
            case ValueType.String:
                const len = buffer.getShort();
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) bytes[i] = buffer.get();
                const s = new TextDecoder().decode(bytes);
                return new Value(s);
            default:
                throw new LoxException(0, `Unsupported type: ${type}`);
        }
    }

    getByteSize(): number {
        const type = this.getValueType();
        if (!type) throw new LoxException(0, "Unknown value type");

        switch (type) {
            case ValueType.Integer:
                return Int32Array.BYTES_PER_ELEMENT + 1;
            case ValueType.Double:
                return Float64Array.BYTES_PER_ELEMENT + 1;
            case ValueType.String:
                const bytes = new TextEncoder().encode(this.asString());
                if (bytes.length > 32767) {
                    throw new LoxException(0, `String exceeds max length: ${bytes.length}`);
                }
                return bytes.length + 3; // 1 byte tag + 2 byte length
            default:
                throw new LoxException(0, `Unsupported type: ${type}`);
        }
    }

    writeTo(buffer: ByteBuffer): void {
        const type = this.getValueType();
        if (!type) throw new LoxException(0, "Unknown value type");

        switch (type) {
            case ValueType.Integer:
                buffer.put(this.vt);
                buffer.putInt(this.asInteger());
                break;
            case ValueType.Double:
                buffer.put(this.vt);
                buffer.putDouble(this.asDouble());
                break;
            case ValueType.String:
                const bytes = new TextEncoder().encode(this.asString());
                buffer.put(this.vt);
                buffer.putShort(bytes.length);
                buffer.putBytes(bytes);
                break;
            default:
                throw new LoxException(0, `Unsupported type: ${type}`);
        }
    }

    isBoolean(): boolean {
        return this.vt === ValueType.Boolean.value;
    }

    isDouble(): boolean {
        return this.vt === ValueType.Double.value;
    }

    isInteger(): boolean {
        return this.vt === ValueType.Integer.value;
    }

    isNumber(): boolean {
        return this.isInteger() || this.isDouble();
    }

    isString(): boolean {
        return this.vt === ValueType.String.value;
    }

    isNull(): boolean {
        return this.vt === ValueType.Null.value;
    }

    isTruthy(): boolean {
        if (this.isNull()) return false;
        if (this.isBoolean()) return this.asBoolean();
        if (this.isString()) return this.asString().length > 0;
        return true;
    }

    isInstance(): boolean {
        return this.vt === ValueType.Instance.value;
    }

    asBoolean(): boolean {
        if (!this.isBoolean()) throw new Error("Not a boolean");
        return this.v as boolean;
    }

    asInteger(): number {
        if (!this.isNumber()) throw new Error("Not a number");
        return Math.trunc(this.v as number);
    }

    asDouble(): number {
        if (!this.isNumber()) throw new Error("Not a number");
        return this.v as number;
    }

    asString(): string {
        if (!this.isString()) throw new Error("Not a string");
        return this.v as string;
    }

    asInstance(): Instance {
        if (!this.isInstance()) throw new Error("Not an instance");
        return this.v as Instance;
    }

    toString(): string {
        return this.v === null ? "null" : String(this.v);
    }

    equals(other: any): boolean {
        if (!(other instanceof Value)) return false;
        const o = other as Value;
        
        if (this.vt !== o.vt) return false;
        const valueType = this.getValueType();
        
        if (!valueType) return false;
        switch (valueType) {
            case ValueType.Null:
                return true;
            case ValueType.Boolean:
                return this.asBoolean() === o.asBoolean();
            case ValueType.Integer:
                return this.asInteger() === o.asInteger();
            case ValueType.Double:
                return this.asDouble() === o.asDouble();
            case ValueType.String:
                return this.asString() === o.asString();
            default:
                return false;
        }
    }
}