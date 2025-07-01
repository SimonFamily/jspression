import { Expr, LogicExpr } from "../../../ir/expr";
import { Parser } from "../../parser";
import { Token } from "../../token";
import { InfixParselet } from "../infixParselet";

export class LogicParselet implements InfixParselet {
    private precedence: number;
    private isRight: boolean;

    constructor(precedence: number);
    constructor(precedence: number, isRight: boolean);
    constructor(precedence: number, isRight?: boolean) {
        this.precedence = precedence;
        this.isRight = isRight ?? false;
    }

    parse(parser: Parser, lhs: Expr, token: Token): Expr {
        const nextPrecedence = this.isRight ? this.precedence - 1 : this.precedence;
        const rhs = parser.expressionPrec(nextPrecedence);
        return new LogicExpr(lhs, token, rhs);
    }

    getPrecedence(): number {
        return this.precedence;
    }
}