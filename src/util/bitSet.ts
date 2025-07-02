export class BitSet {
    private words: number[] = [];
    private static readonly BITS_PER_WORD = 64; // 每个字包含的位数（8个字节，64位）

    /**
     * 创建一个新的 BitSet
     * @param nbits 初始大小（可选）
     */
    constructor(nbits: number = 0) {
        if (nbits > 0) {
            this.words = new Array(this.wordIndex(nbits - 1) + 1).fill(0);
        }
    }

    /**
     * 从字节数组创建 BitSet（兼容 Java 的 BitSet.valueOf(byte[])）
     * @param bytes 字节数组
     * @returns 新的 BitSet 实例
     */
    static valueOf(bytes: Uint8Array): BitSet {
        const bitSet = new BitSet();
        
        // 小端字节序处理（Java 兼容）
        for (let i = 0; i < bytes.length; i++) {
            const byte = bytes[i];
            for (let j = 0; j < 8; j++) {
                if ((byte & (1 << j))) {
                    bitSet.set(i * 8 + j);
                }
            }
        }
        
        return bitSet;
    }

    /**
     * 获取指定位的状态
     * @param bitIndex 位索引
     * @returns 如果位被设置返回 true，否则 false
     */
    get(bitIndex: number): boolean {
        if (bitIndex < 0) {
            throw new Error(`bitIndex < 0: ${bitIndex}`);
        }
        
        const wordIndex = this.wordIndex(bitIndex);
        return (wordIndex < this.words.length) && 
               ((this.words[wordIndex] & (1 << (bitIndex % 64)))) !== 0;
    }

    /**
     * 设置指定位
     * @param bitIndex 位索引
     */
    set(bitIndex: number): void {
        if (bitIndex < 0) {
            throw new Error(`bitIndex < 0: ${bitIndex}`);
        }
        
        const wordIndex = this.wordIndex(bitIndex);
        this.expandTo(wordIndex);
        
        this.words[wordIndex] |= (1 << (bitIndex % 64));
    }

    /**
     * 清除指定位
     * @param bitIndex 位索引
     */
    clear(bitIndex: number): void {
        if (bitIndex < 0) {
            throw new Error(`bitIndex < 0: ${bitIndex}`);
        }
        
        const wordIndex = this.wordIndex(bitIndex);
        if (wordIndex < this.words.length) {
            this.words[wordIndex] &= ~(1 << (bitIndex % 64));
        }
    }

    /**
     * 转换为字节数组（兼容 Java 的 BitSet.toByteArray()）
     * @returns Uint8Array 字节数组
     */
    toByteArray(): Uint8Array {
        // 找到最高位设置的位置
        let maxBit = -1;
        for (let i = 0; i < this.words.length; i++) {
            if (this.words[i] !== 0) {
                maxBit = i * 64 + 63 - Math.clz32(this.words[i]);
            }
        }
        
        // 如果没有位被设置，返回空数组
        if (maxBit === -1) {
            return new Uint8Array(0);
        }
        
        // 计算需要的字节数（向上取整）
        const nBytes = Math.floor((maxBit + 8) / 8);
        const bytes = new Uint8Array(nBytes);
        
        // 小端字节序填充（Java 兼容）
        for (let i = 0; i < nBytes; i++) {
            let byteValue = 0;
            for (let j = 0; j < 8; j++) {
                const bitIndex = i * 8 + j;
                if (this.get(bitIndex)) {
                    byteValue |= (1 << j);
                }
            }
            bytes[i] = byteValue;
        }
        
        return bytes;
    }

    /**
     * 返回位集合的长度（实际使用的位数）
     * @returns 位数
     */
    length(): number {
        if (this.words.length === 0) return 0;
        
        // 找到最高位设置的位置
        let lastWord = this.words[this.words.length - 1];
        let hiBit = (this.words.length - 1) * 64;
        
        // 使用 Math.clz32 计算前导零的数量
        hiBit += (32 - Math.clz32(lastWord));
        return hiBit;
    }

    /**
     * 返回实际使用的字数
     * @returns 字数
     */
    size(): number {
        return this.words.length;
    }

    /**
     * 检查位集合是否为空
     * @returns 如果没有位被设置返回 true，否则 false
     */
    isEmpty(): boolean {
        return this.words.every(word => word === 0);
    }

    /**
     * 计算指定位所在的字索引
     * @param bitIndex 位索引
     * @returns 字索引
     */
    private wordIndex(bitIndex: number): number {
        return Math.floor(bitIndex / BitSet.BITS_PER_WORD);
    }

    /**
     * 扩展位集合到指定的字索引
     * @param wordIndex 字索引
     */
    private expandTo(wordIndex: number): void {
        const wordsRequired = wordIndex + 1;
        if (this.words.length < wordsRequired) {
            // 扩展数组并填充0
            const request = Math.max(2 * this.words.length, wordsRequired);
            const newWords = new Array(request).fill(0);
            for (let i = 0; i < this.words.length; i++) {
                newWords[i] = this.words[i];
            }
            this.words = newWords;
        }
    }

    /**
     * 返回位集合的字符串表示（二进制格式）
     * @returns 二进制字符串
     */
    toString(): string {
        if (this.isEmpty()) return "{}";
        
        const result: string[] = [];
        for (let i = 0; i <= this.length(); i++) {
            if (this.get(i)) {
                result.push(i.toString());
            }
        }
        return `{${result.join(", ")}}`;
    }
}