import { Token } from "./parser/token";
import { TokenType } from "./parser/tokenType";

export class LoxException extends Error {
    constructor(line: number, where: string, message: string);
    constructor(line: number, message: string);
    constructor(token: Token, message: string);
    constructor(arg1: number | Token, arg2?: string, arg3?: string) {
        let message: string;
        
        if (typeof arg1 === "number" && arg3) {
            // (line, where, message) 形式
            message = LoxException.errMsg(arg1, arg2 || "", arg3);
        } else if (typeof arg1 === "number") {
            // (line, message) 形式
            message = LoxException.errMsg(arg1, "", arg2 || "");
        } else {
            // (token, message) 形式
            message = LoxException.errMsg(arg1, arg2 || "");
        }
        
        super(message);
    }

    private static errMsg(token: Token, message: string): string;
    private static errMsg(line: number, where: string, message: string): string;
    private static errMsg(arg1: Token | number, arg2: string, arg3?: string): string {
        if (arg1 instanceof Token) {
            const token = arg1;
            const message = arg2;
            if (token.type === TokenType.EOF) {
                return LoxException.errMsg(token.line, " at end", message);
            } else {
                return LoxException.errMsg(token.line, ` at '${token.lexeme}'`, message);
            }
        } else {
            const line = arg1;
            const where = arg2;
            const message = arg3 || "";
            return `[line ${line}] Error${where}: ${message}`;
        }
    }
}