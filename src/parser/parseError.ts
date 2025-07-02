
import { LoxException } from "../loxException";
import { Token } from './token';

export class LoxParseError extends LoxException {
    constructor(line: number, message: string);
    constructor(token: Token, message: string);
    constructor(arg1: number | Token, message: string) {
        if (typeof arg1 === 'number') {
            super(arg1, message);
        } else {
            super(arg1, message);
        }
    }
}