import { TokenType } from './tokenType';
import { Expr } from '../ir/expr';

import { Scanner } from './scanner';
import { Token } from './token';
import { Precedence } from './precedence';
import { PrefixParselet } from './parselet/prefixParselet';
import { InfixParselet } from './parselet/infixParselet';
import { LiteralParselet } from './parselet/impl/literalParselet';
import { IdParselet } from './parselet/impl/idParselet';
import { GroupParselet } from './parselet/impl/groupParselet';
import { PreUnaryParselet } from './parselet/impl/preUnaryParselet';
import { IfParselet } from './parselet/impl/ifParselet';
import { BinaryParselet } from './parselet/impl/binaryParselet';
import { AssignParselet } from './parselet/impl/assignParselet';
import { LogicParselet } from './parselet/impl/logicParselet';
import { CallParselet } from './parselet/impl/callParselet';
import { GetParselet } from './parselet/impl/getParselet';
import { LoxParseError } from './parseError';

export class Parser {
    private static readonly prefixParselets: Map<TokenType, PrefixParselet> = new Map();
    private static readonly infixParselets: Map<TokenType, InfixParselet> = new Map();
    
    static {
        Parser.prefixParselets.set(TokenType.NUMBER, new LiteralParselet());
        Parser.prefixParselets.set(TokenType.STRING, new LiteralParselet());
        Parser.prefixParselets.set(TokenType.IDENTIFIER, new IdParselet());
        Parser.prefixParselets.set(TokenType.LEFT_PAREN, new GroupParselet());
        Parser.prefixParselets.set(TokenType.MINUS, new PreUnaryParselet(Precedence.PREC_UNARY));
        Parser.prefixParselets.set(TokenType.BANG, new PreUnaryParselet(Precedence.PREC_UNARY));
        Parser.prefixParselets.set(TokenType.IF, new IfParselet());
        
        Parser.infixParselets.set(TokenType.PLUS, new BinaryParselet(Precedence.PREC_TERM));
        Parser.infixParselets.set(TokenType.MINUS, new BinaryParselet(Precedence.PREC_TERM));
        Parser.infixParselets.set(TokenType.PERCENT, new BinaryParselet(Precedence.PREC_MODE));
        Parser.infixParselets.set(TokenType.STAR, new BinaryParselet(Precedence.PREC_FACTOR));
        Parser.infixParselets.set(TokenType.SLASH, new BinaryParselet(Precedence.PREC_FACTOR));
        Parser.infixParselets.set(TokenType.STARSTAR, new BinaryParselet(Precedence.PREC_POWER, true));
        Parser.infixParselets.set(TokenType.EQUAL, new AssignParselet(Precedence.PREC_ASSIGNMENT));
        Parser.infixParselets.set(TokenType.OR, new LogicParselet(Precedence.PREC_OR));
        Parser.infixParselets.set(TokenType.AND, new LogicParselet(Precedence.PREC_AND));
        Parser.infixParselets.set(TokenType.EQUAL_EQUAL, new BinaryParselet(Precedence.PREC_EQUALITY));
        Parser.infixParselets.set(TokenType.BANG_EQUAL, new BinaryParselet(Precedence.PREC_EQUALITY));
        Parser.infixParselets.set(TokenType.LESS, new BinaryParselet(Precedence.PREC_COMPARISON));
        Parser.infixParselets.set(TokenType.LESS_EQUAL, new BinaryParselet(Precedence.PREC_COMPARISON));
        Parser.infixParselets.set(TokenType.GREATER, new BinaryParselet(Precedence.PREC_COMPARISON));
        Parser.infixParselets.set(TokenType.GREATER_EQUAL, new BinaryParselet(Precedence.PREC_COMPARISON));
        Parser.infixParselets.set(TokenType.LEFT_PAREN, new CallParselet(Precedence.PREC_CALL));
        Parser.infixParselets.set(TokenType.DOT, new GetParselet(Precedence.PREC_CALL));
    }
    
    private tokens: Token[];
    private current: number = 0;
    
    constructor(source: string) {
        const scanner = new Scanner(source);
        this.tokens = scanner.scanTokens();
    }
    
    /**
     * 解析表达式
     * @returns 解析后的表达式
     */
    public parse(): Expr {
        const result = this.expressionPrec(Precedence.PREC_NONE);
        if (this.peek().type !== TokenType.EOF) {
            throw new LoxParseError(this.peek(), `Unknown token: ${this.peek().lexeme}`);
        }
        return result;
    }
    
    /**
     * 解析操作符优先级大于min_prec的子表达式
     * @param min_prec 优先级下限（不包含）
     * @returns 解析后的表达式
     */
    public expressionPrec(min_prec: Precedence): Expr {
        const token = this.advance();
        const prefixParselet = Parser.prefixParselets.get(token.type);
        
        if (!prefixParselet) {
            throw new LoxParseError(token, `Unknown token: ${token.lexeme}`);
        }
        
        let lhs: Expr = prefixParselet.parse(this, token);
        
        while (this.peek().type !== TokenType.EOF) {
            const next = this.peek();
            const infixParselet = Parser.infixParselets.get(next.type);
            const precedence = infixParselet ? infixParselet.getPrecedence() : 0;
            
            if (precedence <= min_prec) {
                break;
            }
            
            const operatorToken = this.advance();
            lhs = infixParselet!.parse(this, lhs, operatorToken);
        }
        
        return lhs;
    }
    
    public match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }
    
    public consume(expected: TokenType): Token;
    public consume(expected: TokenType, message: string): Token;
    public consume(expected: TokenType, message: string = `Expected token ${TokenType[expected]} but found ${TokenType[this.peek().type]}`): Token {
        if (this.check(expected)) {
            return this.advance();
        }
        throw new LoxParseError(this.peek(), message);
    }

    public advance(): Token {
        if (!this.isAtEnd()) {
            this.current++;
        }
        return this.previous();
    }

    public check(type: TokenType): boolean {
        return this.peek().type === type;
    }

    public peek(): Token {
        return this.tokens[this.current];
    }

    public previous(): Token {
        return this.tokens[this.current - 1];
    }
    
    private isAtEnd(): boolean {
        return this.peek().type === TokenType.EOF;
    }
}