// 兼容 ES2015 的 BitSet，支持大 bitIndex，所有位操作分高低 32 位处理
// 采用 {lo, hi} 结构模拟 64 位 word，所有位操作分高低 32 位处理
export class BitSet {
    private words: { lo: number, hi: number }[] = [];
    private static readonly BITS_PER_WORD = 64;

    constructor(nbits: number = 0) {
        if (nbits > 0) {
            this.words = new Array(this.wordIndex(nbits - 1) + 1).fill(0).map(() => ({ lo: 0, hi: 0 }));
        }
    }

    static valueOf(bytes: Uint8Array): BitSet {
        const bitSet = new BitSet();
        let wordIdx = 0;
        for (let i = 0; i < bytes.length; i += 8) {
            let lo = 0, hi = 0;
            for (let j = 0; j < 4 && i + j < bytes.length; j++) {
                lo |= bytes[i + j] << (8 * j);
            }
            for (let j = 0; j < 4 && i + 4 + j < bytes.length; j++) {
                hi |= bytes[i + 4 + j] << (8 * j);
            }
            if (lo !== 0 || hi !== 0) {
                bitSet.words[wordIdx++] = { lo: lo >>> 0, hi: hi >>> 0 };
            }
        }
        return bitSet;
    }

    get(bitIndex: number): boolean {
        if (bitIndex < 0) throw new Error(`bitIndex < 0: ${bitIndex}`);
        const wordIndex = this.wordIndex(bitIndex);
        if (wordIndex >= this.words.length) return false;
        const { lo, hi } = this.words[wordIndex];
        if (bitIndex % 64 < 32) {
            return ((lo >>> (bitIndex % 32)) & 1) !== 0;
        } else {
            return ((hi >>> (bitIndex % 32)) & 1) !== 0;
        }
    }

    set(bitIndex: number): void {
        if (bitIndex < 0) throw new Error(`bitIndex < 0: ${bitIndex}`);
        const wordIndex = this.wordIndex(bitIndex);
        this.expandTo(wordIndex);
        if (bitIndex % 64 < 32) {
            this.words[wordIndex].lo |= (1 << (bitIndex % 32));
        } else {
            this.words[wordIndex].hi |= (1 << (bitIndex % 32));
        }
    }

    clear(bitIndex: number): void {
        if (bitIndex < 0) throw new Error(`bitIndex < 0: ${bitIndex}`);
        const wordIndex = this.wordIndex(bitIndex);
        if (wordIndex < this.words.length) {
            if (bitIndex % 64 < 32) {
                this.words[wordIndex].lo &= ~(1 << (bitIndex % 32));
            } else {
                this.words[wordIndex].hi &= ~(1 << (bitIndex % 32));
            }
        }
    }

    toByteArray(): Uint8Array {
        // 找到最高 set 位的 word
        let lastWord = this.words.length - 1;
        while (lastWord >= 0 && this.words[lastWord].lo === 0 && this.words[lastWord].hi === 0) lastWord--;
        if (lastWord < 0) return new Uint8Array(0);
        const byteLen = (lastWord + 1) * 8;
        const bytes = new Uint8Array(byteLen);
        for (let i = 0; i <= lastWord; i++) {
            let { lo, hi } = this.words[i];
            for (let j = 0; j < 4; j++) {
                bytes[i * 8 + j] = lo & 0xFF;
                lo >>>= 8;
            }
            for (let j = 0; j < 4; j++) {
                bytes[i * 8 + 4 + j] = hi & 0xFF;
                hi >>>= 8;
            }
        }
        // 去除末尾多余的 0 字节
        let realLen = bytes.length;
        while (realLen > 0 && bytes[realLen - 1] === 0) realLen--;
        return bytes.slice(0, realLen);
    }

    length(): number {
        let lastWord = this.words.length - 1;
        while (lastWord >= 0 && this.words[lastWord].lo === 0 && this.words[lastWord].hi === 0) lastWord--;
        if (lastWord < 0) return 0;
        const { lo, hi } = this.words[lastWord];
        if (hi !== 0) {
            return lastWord * 64 + 32 + 32 - Math.clz32(hi);
        } else {
            return lastWord * 64 + 32 - Math.clz32(lo);
        }
    }

    size(): number {
        return this.words.length;
    }

    isEmpty(): boolean {
        return this.words.every(word => word.lo === 0 && word.hi === 0);
    }

    private wordIndex(bitIndex: number): number {
        return Math.floor(bitIndex / BitSet.BITS_PER_WORD);
    }

    private expandTo(wordIndex: number): void {
        const wordsRequired = wordIndex + 1;
        while (this.words.length < wordsRequired) {
            this.words.push({ lo: 0, hi: 0 });
        }
    }

    toString(): string {
        if (this.isEmpty()) return "{}";
        const result: string[] = [];
        for (let i = 0; i < this.length(); i++) {
            if (this.get(i)) result.push(i.toString());
        }
        return `{${result.join(", ")}}`;
    }
}