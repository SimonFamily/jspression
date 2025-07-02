import { ByteBuffer } from '../../src/util/byteBuffer';

describe('ByteBuffer', () => {
  it('should put and get bytes correctly', () => {
    const buf = new ByteBuffer(8);
    buf.put(0x12);
    buf.put(0x34);
    expect(buf.position).toBe(2);
    buf.position = 0;
    expect(buf.get()).toBe(0x12);
    expect(buf.get()).toBe(0x34);
  });

  it('should put and get short/int/double correctly', () => {
    const buf = new ByteBuffer(16);
    buf.putShort(0x1234);
    buf.putInt(0x12345678);
    buf.putDouble(3.14159);
    buf.position = 0;
    expect(buf.getShort()).toBe(0x1234);
    expect(buf.getInt()).toBe(0x12345678);
    expect(Math.abs(buf.getDouble() - 3.14159)).toBeLessThan(1e-10);
  });

  it('should handle putBytes and toBytes', () => {
    const buf = new ByteBuffer(4);
    buf.putBytes(new Uint8Array([1,2,3,4]));
    expect(Array.from(buf.toBytes())).toEqual([1,2,3,4]);
  });

  it('should throw on position out of range', () => {
    const buf = new ByteBuffer(2);
    expect(() => { buf.position = -1; }).toThrow();
    expect(() => { buf.position = 3; }).toThrow();
  });

  it('should auto expand when needed', () => {
    const buf = new ByteBuffer(2);
    buf.put(1);
    buf.put(2);
    buf.put(3); // 触发扩容
    buf.put(4);
    expect(buf.bufferLength).toBeGreaterThanOrEqual(3);
    expect(buf.position).toBe(4);
  });

  it('should copy from another ByteBuffer', () => {
    const src = new ByteBuffer(4);
    src.putBytes(new Uint8Array([9,8,7,6]));
    const dst = new ByteBuffer(2);
    dst.copyFrom(src, 1, 3);
    expect(Array.from(dst.toBytes())).toEqual([8,7]);
  });

  it('should support setEndian', () => {
    const buf = new ByteBuffer(8);
    buf.setEndian(true); // 小端
    buf.putShort(0x1234);
    buf.position = 0;
    expect(buf.getShort()).toBe(0x1234);
  });

  it('should support putIntAt', () => {
    const buf = new ByteBuffer(8);
    buf.putIntAt(0, 0x11223344);
    buf.position = 0;
    expect(buf.getInt()).toBe(0x11223344);
  });

  it('should slice buffer', () => {
    const buf = new ByteBuffer(8);
    buf.putBytes(new Uint8Array([1,2,3,4,5]));
    expect(Array.from(buf.slice(1,4))).toEqual([2,3,4]);
  });
});
