import { Parser } from '../../src/parser/parser';
import { Expr, BinaryExpr, UnaryExpr, LiteralExpr, IdExpr } from '../../src/ir/expr';

describe('Parser (expression only)', () => {
  function parseExpr(src: string): Expr {
    return new Parser(src).parse();
  }

  it('should parse number literal', () => {
    const expr = parseExpr('123');
    expect(expr).toBeInstanceOf(LiteralExpr);
    expect(expr.toString()).toBe('123');
  });

  it('should parse string literal', () => {
    const expr = parseExpr('"abc"');
    expect(expr).toBeInstanceOf(LiteralExpr);
    expect(expr.toString()).toBe('abc');
  });

  it('should parse identifier', () => {
    const expr = parseExpr('foo');
    expect(expr).toBeInstanceOf(IdExpr);
    expect(expr.toString()).toBe('foo');
  });

  it('should parse unary expression', () => {
    const expr = parseExpr('-1');
    expect(expr).toBeInstanceOf(UnaryExpr);
    expect((expr as UnaryExpr).right).toBeInstanceOf(LiteralExpr);
  });

  it('should parse binary expression', () => {
    const expr = parseExpr('1 + 2');
    expect(expr).toBeInstanceOf(BinaryExpr);
    expect((expr as BinaryExpr).operator.lexeme).toBe('+');
  });

  it('should respect operator precedence', () => {
    const expr = parseExpr('1 + 2 * 3');
    expect(expr).toBeInstanceOf(BinaryExpr);
    const right = (expr as BinaryExpr).right;
    expect(right).toBeInstanceOf(BinaryExpr);
  });

  it('should parse grouped expression', () => {
    const expr = parseExpr('3 * (1 + 2)');
    expect(expr).toBeInstanceOf(BinaryExpr);
    const right = (expr as BinaryExpr).right;
    expect(right).toBeInstanceOf(BinaryExpr);
    expect((right as BinaryExpr).left.toString()).toBe('1');
    expect((right as BinaryExpr).right.toString()).toBe('2');
  });

  it('should throw on invalid input', () => {
    expect(() => parseExpr('@')).toThrow();
  });
});
