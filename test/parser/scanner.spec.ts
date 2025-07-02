import { Scanner } from '../../src/parser/scanner';
import { TokenType } from '../../src/parser/tokenType';

describe('Scanner', () => {
  it('should scan single-character tokens', () => {
    const scanner = new Scanner('(){},.-+*;/%');
    const tokens = scanner.scanTokens();
    expect(tokens.map(t => t.type)).toEqual([
      TokenType.LEFT_PAREN, TokenType.RIGHT_PAREN, TokenType.LEFT_BRACE, TokenType.RIGHT_BRACE,
      TokenType.COMMA, TokenType.DOT, TokenType.MINUS, TokenType.PLUS, TokenType.STAR, TokenType.SEMICOLON, TokenType.SLASH, TokenType.PERCENT, TokenType.EOF
    ]);
  });

  it('should scan double-character tokens', () => {
    const scanner = new Scanner('!= == >= <= && || //');
    const tokens = scanner.scanTokens();
    expect(tokens.map(t => t.type)).toEqual([
      TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL, TokenType.GREATER_EQUAL, TokenType.LESS_EQUAL,
      TokenType.AND, TokenType.OR, TokenType.EOF
    ]);
  });

  it('should scan numbers and identifiers', () => {
    const scanner = new Scanner('123 45.67 abc _var');
    const tokens = scanner.scanTokens();
    expect(tokens[0].type).toBe(TokenType.NUMBER);
    expect(tokens[0].literal?.getValue()).toBe(123);
    expect(tokens[1].type).toBe(TokenType.NUMBER);
    expect(tokens[1].literal?.getValue()).toBeCloseTo(45.67);
    expect(tokens[2].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[2].lexeme).toBe('abc');
    expect(tokens[3].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[3].lexeme).toBe('_var');
  });

  it('should scan string literals', () => {
    const scanner = new Scanner('"hello world"');
    const tokens = scanner.scanTokens();
    expect(tokens[0].type).toBe(TokenType.STRING);
    expect(tokens[0].literal?.getValue()).toBe('hello world');
  });

  it('should recognize keywords', () => {
    const scanner = new Scanner('class else false for fun if null print return super this true var while');
    const tokens = scanner.scanTokens();
    const types = tokens.map(t => t.type);
    expect(types).toContain(TokenType.CLASS);
    expect(types).toContain(TokenType.ELSE);
    expect(types).toContain(TokenType.FALSE);
    expect(types).toContain(TokenType.FOR);
    expect(types).toContain(TokenType.FUN);
    expect(types).toContain(TokenType.IF);
    expect(types).toContain(TokenType.NULL);
    expect(types).toContain(TokenType.PRINT);
    expect(types).toContain(TokenType.RETURN);
    expect(types).toContain(TokenType.SUPER);
    expect(types).toContain(TokenType.THIS);
    expect(types).toContain(TokenType.TRUE);
    expect(types).toContain(TokenType.VAR);
    expect(types).toContain(TokenType.WHILE);
  });

  it('should skip comments', () => {
    const scanner = new Scanner('123 // this is a comment\n456');
    const tokens = scanner.scanTokens();
    expect(tokens.some(t => t.literal?.getValue() === 123)).toBe(true);
    expect(tokens.some(t => t.literal?.getValue() === 456)).toBe(true);
  });

  it('should throw on unterminated string', () => {
    const scanner = new Scanner('"abc');
    expect(() => scanner.scanTokens()).toThrow();
  });

  it('should throw on unknown character', () => {
    const scanner = new Scanner('@');
    expect(() => scanner.scanTokens()).toThrow();
  });
});