import { LoxException } from "./loxException";
import { Token } from "./parser/token";

export class CompileError extends LoxException {
    constructor(line: number, message: string);
    constructor(token: Token, message: string);
    constructor(arg1: number | Token, arg2: string) {
        if (typeof arg1 === "number") {
            super(arg1, arg2);
        } else {
            super(arg1, arg2);
        }
    }
}