import { ValuesHelper } from '../../src/values/valuesHelper';
import { Value } from '../../src/values/value';
import { TokenType } from '../../src/parser/tokenType';

function v(val: any, isInt?: boolean) {
  if (typeof val === 'number' && isInt) return new Value(val, true);
  return new Value(val);
}

describe('ValuesHelper', () => {
  describe('binaryOperate', () => {
    it('should add numbers and strings', () => {
      expect(ValuesHelper.binaryOperate(v(1, true), v(2, true), TokenType.PLUS).asInteger()).toBe(3);
      expect(ValuesHelper.binaryOperate(v(1.5), v(2.5), TokenType.PLUS).asDouble()).toBeCloseTo(4.0);
      expect(ValuesHelper.binaryOperate(v('a'), v('b'), TokenType.PLUS).asString()).toBe('ab');
      expect(ValuesHelper.binaryOperate(v('a'), v(1, true), TokenType.PLUS).asString()).toBe('a1');
    });
    it('should subtract, multiply, divide, mod', () => {
      expect(ValuesHelper.binaryOperate(v(5, true), v(2, true), TokenType.MINUS).asInteger()).toBe(3);
      expect(ValuesHelper.binaryOperate(v(5.5), v(2), TokenType.MINUS).asDouble()).toBeCloseTo(3.5);
      expect(ValuesHelper.binaryOperate(v(3, true), v(2, true), TokenType.STAR).asInteger()).toBe(6);
      expect(ValuesHelper.binaryOperate(v(3.5), v(2), TokenType.STAR).asDouble()).toBeCloseTo(7.0);
      expect(ValuesHelper.binaryOperate(v(7, true), v(2, true), TokenType.SLASH).asInteger()).toBe(3);
      expect(ValuesHelper.binaryOperate(v(7.0), v(2.0), TokenType.SLASH).asDouble()).toBeCloseTo(3.5);
      expect(ValuesHelper.binaryOperate(v(7, true), v(2, true), TokenType.PERCENT).asInteger()).toBe(1);
      expect(ValuesHelper.binaryOperate(v(7.0), v(2.0), TokenType.PERCENT).asDouble()).toBeCloseTo(1.0);
    });
    it('should power', () => {
      expect(ValuesHelper.binaryOperate(v(2, true), v(3, true), TokenType.STARSTAR).asDouble()).toBe(8);
    });
    it('should compare', () => {
      expect(ValuesHelper.binaryOperate(v(3, true), v(2, true), TokenType.GREATER).asBoolean()).toBe(true);
      expect(ValuesHelper.binaryOperate(v(2, true), v(2, true), TokenType.GREATER_EQUAL).asBoolean()).toBe(true);
      expect(ValuesHelper.binaryOperate(v(1, true), v(2, true), TokenType.LESS).asBoolean()).toBe(true);
      expect(ValuesHelper.binaryOperate(v(2, true), v(2, true), TokenType.LESS_EQUAL).asBoolean()).toBe(true);
    });
    it('should test equality', () => {
      expect(ValuesHelper.binaryOperate(v(1, true), v(1, true), TokenType.EQUAL_EQUAL).asBoolean()).toBe(true);
      expect(ValuesHelper.binaryOperate(v(1, true), v(2, true), TokenType.BANG_EQUAL).asBoolean()).toBe(true);
    });
    it('should throw on invalid operand types', () => {
      expect(() => ValuesHelper.binaryOperate(v(true), v(1, true), TokenType.PLUS)).toThrow();
      expect(() => ValuesHelper.binaryOperate(v(1, true), v(true), TokenType.MINUS)).toThrow();
    });
  });

  describe('preUnaryOperate', () => {
    it('should negate boolean', () => {
      expect(ValuesHelper.preUnaryOperate(v(true), TokenType.BANG).asBoolean()).toBe(false);
      expect(ValuesHelper.preUnaryOperate(v(false), TokenType.BANG).asBoolean()).toBe(true);
    });
    it('should negate numbers', () => {
      expect(ValuesHelper.preUnaryOperate(v(2, true), TokenType.MINUS).asInteger()).toBe(-2);
      expect(ValuesHelper.preUnaryOperate(v(2.5), TokenType.MINUS).asDouble()).toBeCloseTo(-2.5);
    });
    it('should throw on invalid operand', () => {
      expect(() => ValuesHelper.preUnaryOperate(v('a'), TokenType.MINUS)).toThrow();
    });
  });
});
