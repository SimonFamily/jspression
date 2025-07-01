import { Value } from "../values/value";
import { Token } from "./token";
import { TokenType } from "./tokenType";


class LoxParseError extends Error {
    constructor(public line: number, message: string) {
        super(message);
        this.name = "LoxParseError";
    }
}

export class Scanner {
    private readonly keywords: Map<string, TokenType> = new Map([
        ["class", TokenType.CLASS],
        ["else", TokenType.ELSE],
        ["false", TokenType.FALSE],
        ["for", TokenType.FOR],
        ["fun", TokenType.FUN],
        ["if", TokenType.IF],
        ["null", TokenType.NULL],
        ["print", TokenType.PRINT],
        ["return", TokenType.RETURN],
        ["super", TokenType.SUPER],
        ["this", TokenType.THIS],
        ["true", TokenType.TRUE],
        ["var", TokenType.VAR],
        ["while", TokenType.WHILE]
    ]);
    
    private tokens: Token[] = [];
    private start: number = 0;
    private current: number = 0;
    private line: number = 1;
    
    constructor(private source: string) {}
    
    public scanTokens(): Token[] {
        while (!this.isEnd()) {
            this.start = this.current;
            this.scanToken();
        }
        this.tokens.push(new Token(TokenType.EOF, "", null, this.line));
        return this.tokens;
    }
    
    private scanToken(): void {
        const c = this.advance();
        switch (c) {
            // 单字符符号
            case '(': this.addToken(TokenType.LEFT_PAREN); break;
            case ')': this.addToken(TokenType.RIGHT_PAREN); break;
            case '{': this.addToken(TokenType.LEFT_BRACE); break;
            case '}': this.addToken(TokenType.RIGHT_BRACE); break;
            case ',': this.addToken(TokenType.COMMA); break;
            case '.': this.addToken(TokenType.DOT); break;
            case '-': this.addToken(TokenType.MINUS); break;
            case '+': this.addToken(TokenType.PLUS); break;
            case '*': 
                this.addToken(this.match('*') ? TokenType.STARSTAR : TokenType.STAR); 
                break;
            case ';': this.addToken(TokenType.SEMICOLON); break;
            case '%': this.addToken(TokenType.PERCENT); break;
                
            // 双字符符号
            case '!': 
                this.addToken(this.match('=') ? TokenType.BANG_EQUAL : TokenType.BANG); 
                break;
            case '=': 
                this.addToken(this.match('=') ? TokenType.EQUAL_EQUAL : TokenType.EQUAL); 
                break;
            case '>': 
                this.addToken(this.match('=') ? TokenType.GREATER_EQUAL : TokenType.GREATER); 
                break;
            case '<': 
                this.addToken(this.match('=') ? TokenType.LESS_EQUAL : TokenType.LESS); 
                break;
                
            // 注释和斜线
            case '/': 
                if (this.match('/')) {
                    while (this.peek() !== '\n' && !this.isEnd()) this.advance();
                } else {
                    this.addToken(TokenType.SLASH);
                }
                break;
                
            // 逻辑运算符
            case '|': 
                if (this.match('|')) this.addToken(TokenType.OR);
                else throw new LoxParseError(this.line, `Unknown character: ${c}`);
                break;
            case '&': 
                if (this.match('&')) this.addToken(TokenType.AND);
                else throw new LoxParseError(this.line, `Unknown character: ${c}`);
                break;
                
            // 空白字符
            case ' ':
            case '\t':
            case '\r':
                break;
                
            case '\n':
                this.line++;
                break;
                
            // 字符串字面量
            case '"': 
                this.string(); 
                break;
                
            default:
                if (this.isDigit(c)) {
                    this.number();
                } else if (this.isAlpha(c)) {
                    this.identifier();
                } else {
                    throw new LoxParseError(this.line, `Unknown character: ${c}`);
                }
                break;
        }
    }
    
    private string(): void {
        while (this.peek() !== '"' && !this.isEnd()) {
            if (this.peek() === '\n') this.line++;
            this.advance();
        }
        
        if (this.isEnd()) {
            throw new LoxParseError(this.line, "Unterminated string.");
        }
        
        // 闭合引号
        this.advance();
        
        // 提取字符串内容（去除引号）
        const value = this.source.substring(this.start + 1, this.current - 1);
        this.addToken(TokenType.STRING, value);
    }
    
    private number(): void {
        while (this.isDigit(this.peek())) this.advance();
        
        // 处理小数部分
        if (this.peek() === '.' && this.isDigit(this.peekNext())) {
            // 消费小数点
            this.advance();
            while (this.isDigit(this.peek())) this.advance();
        }
        
        const numText = this.source.substring(this.start, this.current);
        const value = numText.includes('.') ? parseFloat(numText) : parseInt(numText);
        this.addToken(TokenType.NUMBER, value);
    }
    
    private identifier(): void {
        while (this.isAlphaNumeric(this.peek())) this.advance();
        
        const text = this.source.substring(this.start, this.current);
        const type = this.keywords.get(text) || TokenType.IDENTIFIER;
        this.addToken(type);
    }
    
    private advance(): string {
        return this.source.charAt(this.current++);
    }
    
    private match(expected: string): boolean {
        if (this.isEnd()) return false;
        if (this.source.charAt(this.current) !== expected) return false;
        
        this.current++;
        return true;
    }
    
    private peek(): string {
        if (this.isEnd()) return '\0';
        return this.source.charAt(this.current);
    }
    
    private peekNext(): string {
        if (this.current + 1 >= this.source.length) return '\0';
        return this.source.charAt(this.current + 1);
    }
    
    private isEnd(): boolean {
        return this.current >= this.source.length;
    }
    
    private addToken(type: TokenType, literal: any = null): void {
        const text = this.source.substring(this.start, this.current);
        this.tokens.push(new Token(type, text, literal, this.line));
    }
    
    private isDigit(c: string): boolean {
        return /^\d$/.test(c);
    }
    
    private isAlpha(c: string): boolean {
        return /^[a-zA-Z_]$/.test(c) || this.isChineseCharacter(c);
    }
    
    private isAlphaNumeric(c: string): boolean {
        return this.isDigit(c) || this.isAlpha(c);
    }
    
    private isChineseCharacter(c: string): boolean {
        const code = c.charCodeAt(0);
        return (code >= 0x4E00 && code <= 0x9FFF) ||  // 基本汉字
               (code >= 0x3400 && code <= 0x4DBF);   // 扩展A区
    }
}