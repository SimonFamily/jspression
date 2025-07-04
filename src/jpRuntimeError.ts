import { Token } from "./parser/token";
import { TokenType } from "./parser/tokenType";

export class JpRuntimeError extends Error {
    public readonly token: Token | null;

    constructor(message: string);
    constructor(token: Token, message: string);
    constructor(arg1: Token | string, arg2?: string) {
        let message: string;
        let token: Token | null = null;

        if (typeof arg1 === "string") {
            // 只有一个参数：message
            message = arg1;
        } else {
            // 两个参数：token 和 message
            token = arg1;
            message = arg2!; // 非空断言，因为有两个参数时arg2一定存在
        }

        super(message);
        this.name = "JpRuntimeError";
        this.token = token;
    }

    public toString(): string {
        if (this.token) {
            const where = this.token.type === TokenType.EOF 
                ? " at end" 
                : ` at '${this.token.lexeme}'`;
            return `[line ${this.token.line}] RuntimeError${where}: ${this.message}`;
        } else {
            return `RuntimeError: ${this.message}`;
        }
    }
}