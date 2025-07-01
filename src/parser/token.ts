import { Value } from "../values/value";
import { TokenType } from "./tokenType";

export class Token {
    public readonly type: TokenType;
    public readonly lexeme: string;
    public readonly literal: any;
    public readonly line: number;

    constructor(type: TokenType, lexeme: string, litera: any, line: number) {
        this.type = type;
        this.lexeme = lexeme;
        this.literal = litera;
        this.line = line;
    }

    public toString(): string {
        return `${TokenType[this.type]} ${this.lexeme} ${this.literal}`;
    }
}