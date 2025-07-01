export class ByteBuffer {
    private buffer: Uint8Array;
    private view: DataView;
    private _position: number = 0;
    private _capacity: number;
    private littleEndian: boolean = false; // 默认大端序（网络字节序）

    constructor(capacity: number) {
        this._capacity = capacity;
        this.buffer = new Uint8Array(capacity);
        this.view = new DataView(this.buffer.buffer);
    }

    static fromBytes(bytes: Uint8Array): ByteBuffer {
        const buffer = new ByteBuffer(bytes.length);
        buffer.buffer.set(bytes);
        return buffer;
    }

    get bufferLength(): number {
        return this._capacity;
    }

    get position(): number {
        return this._position;
    }

    set position(pos: number) {
        if (pos < 0 || pos > this._capacity) {
            throw new Error(`Position out of range: ${pos}`);
        }
        this._position = pos;
    }

    remaining(): number {
        return this._capacity - this._position;
    }

    clear(): void {
        this._position = 0;
    }

    put(value: number): void {
        this.ensureCapacity(1);
        this.buffer[this._position++] = value & 0xFF;
    }

    putBytes(bytes: Uint8Array): void {
        this.ensureCapacity(bytes.length);
        this.buffer.set(bytes, this._position);
        this._position += bytes.length;
    }

    putShort(value: number): void {
        this.ensureCapacity(2);
        this.view.setInt16(this._position, value, this.littleEndian);
        this._position += 2;
    }

    putInt(value: number): void {
        this.ensureCapacity(4);
        this.view.setInt32(this._position, value, this.littleEndian);
        this._position += 4;
    }

    putIntAt(index: number, value: number): void {
        if (index < 0 || index + 4 > this._capacity) {
            throw new Error(`Index out of range: ${index}`);
        }
        this.view.setInt32(index, value, this.littleEndian);
    }

    putDouble(value: number): void {
        this.ensureCapacity(8);
        this.view.setFloat64(this._position, value, this.littleEndian);
        this._position += 8;
    }

    get(): number {
        if (this._position >= this._capacity) {
            throw new Error("Buffer underflow");
        }
        return this.buffer[this._position++];
    }

    getShort(): number {
        if (this._position + 2 > this._capacity) {
            throw new Error("Buffer underflow");
        }
        const value = this.view.getInt16(this._position, this.littleEndian);
        this._position += 2;
        return value;
    }

    getInt(): number {
        if (this._position + 4 > this._capacity) {
            throw new Error("Buffer underflow");
        }
        const value = this.view.getInt32(this._position, this.littleEndian);
        this._position += 4;
        return value;
    }

    getDouble(): number {
        if (this._position + 8 > this._capacity) {
            throw new Error("Buffer underflow");
        }
        const value = this.view.getFloat64(this._position, this.littleEndian);
        this._position += 8;
        return value;
    }

    toBytes(): Uint8Array {
        return this.buffer.slice(0, this._position);
    }

    newPosition(pos: number): void {
        this.position = pos;
    }

    copyFrom(source: ByteBuffer, sourceStart: number = 0, sourceEnd: number = source.position): void {
        // 计算要复制的字节数
        const copyLength = sourceEnd - sourceStart;
        
        // 确保当前缓冲区有足够空间
        this.ensureCapacity(copyLength);
        
        // 获取源数据
        const sourceData = source.buffer.slice(sourceStart, sourceEnd);
        
        // 复制数据到当前缓冲区
        this.buffer.set(sourceData, this._position);
        
        // 更新位置指针
        this._position += copyLength;
    }

    private ensureCapacity(required: number): void {
        if (this.remaining() >= required) return;

        const newCapacity = Math.max(this._capacity * 2, this._capacity + required);
        const newBuffer = new Uint8Array(newCapacity);
        
        // 复制现有数据
        newBuffer.set(this.buffer);
        
        // 更新引用
        this.buffer = newBuffer;
        this.view = new DataView(this.buffer.buffer);
        this._capacity = newCapacity;
    }

    // 辅助方法
    slice(start: number, end: number): Uint8Array {
        return this.buffer.slice(start, end);
    }

    setEndian(littleEndian: boolean): void {
        this.littleEndian = littleEndian;
    }
}