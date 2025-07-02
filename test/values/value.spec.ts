import { Value } from '../../src/values/value';
import { ValueType } from '../../src/values/valueType';
import { ByteBuffer } from '../../src/util/byteBuffer';

describe('Value', () => {
  it('should create null value by default', () => {
    const v = new Value();
    expect(v.isNull()).toBe(true);
    expect(v.getValue()).toBeNull();
    expect(v.getValueType()).toBe(ValueType.Null);
  });

  it('should create integer and double values', () => {
    const vi = new Value(123, true);
    expect(vi.isInteger()).toBe(true);
    expect(vi.asInteger()).toBe(123);
    expect(vi.getValueType()).toBe(ValueType.Integer);
    const vd = new Value(3.14);
    expect(vd.isDouble()).toBe(true);
    expect(vd.asDouble()).toBeCloseTo(3.14);
    expect(vd.getValueType()).toBe(ValueType.Double);
  });

  it('should create string and boolean values', () => {
    const vs = new Value('hello');
    expect(vs.isString()).toBe(true);
    expect(vs.asString()).toBe('hello');
    expect(vs.getValueType()).toBe(ValueType.String);
    const vb = new Value(true);
    expect(vb.isBoolean()).toBe(true);
    expect(vb.asBoolean()).toBe(true);
    expect(vb.getValueType()).toBe(ValueType.Boolean);
  });

  it('should support isTruthy', () => {
    expect(new Value().isTruthy()).toBe(false);
    expect(new Value(false).isTruthy()).toBe(false);
    expect(new Value(true).isTruthy()).toBe(true);
    expect(new Value('').isTruthy()).toBe(false);
    expect(new Value('abc').isTruthy()).toBe(true);
    expect(new Value(0).isTruthy()).toBe(true);
  });

  it('should throw on invalid asXXX', () => {
    const v = new Value('abc');
    expect(() => v.asInteger()).toThrow();
    expect(() => v.asDouble()).toThrow();
    expect(() => v.asBoolean()).toThrow();
  });

  it('should support equals', () => {
    expect(new Value(1, true).equals(new Value(1, true))).toBe(true);
    expect(new Value(1, true).equals(new Value(2, true))).toBe(false);
    expect(new Value('a').equals(new Value('a'))).toBe(true);
    expect(new Value('a').equals(new Value('b'))).toBe(false);
    expect(new Value().equals(new Value())).toBe(true);
    expect(new Value(true).equals(new Value(false))).toBe(false);
  });

  it('should support toString', () => {
    expect(new Value().toString()).toBe('null');
    expect(new Value(123, true).toString()).toBe('123');
    expect(new Value('abc').toString()).toBe('abc');
  });

  it('should support writeTo/getFrom for int/double/string', () => {
    const vint = new Value(42, true);
    const vdouble = new Value(3.14);
    const vstr = new Value('hi');
    const buf = new ByteBuffer(32);
    vint.writeTo(buf);
    vdouble.writeTo(buf);
    vstr.writeTo(buf);
    buf.position = 0;
    const rint = Value.getFrom(buf);
    const rdouble = Value.getFrom(buf);
    const rstr = Value.getFrom(buf);
    expect(rint.isInteger()).toBe(true);
    expect(rint.asInteger()).toBe(42);
    expect(rdouble.isDouble()).toBe(true);
    expect(rdouble.asDouble()).toBeCloseTo(3.14);
    expect(rstr.isString()).toBe(true);
    expect(rstr.asString()).toBe('hi');
  });

  it('should throw for unsupported type in getFrom', () => {
    const buf = new ByteBuffer(4);
    buf.put(99); // 非法tag
    buf.position = 0;
    expect(() => Value.getFrom(buf)).toThrow();
  });

  it('should throw for oversized string in getByteSize', () => {
    const v = new Value('a'.repeat(40000));
    expect(() => v.getByteSize()).toThrow();
  });
});
