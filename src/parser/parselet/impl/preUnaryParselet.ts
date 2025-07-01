import { Expr, UnaryExpr } from "../../../ir/expr";
import { Parser } from "../../parser";
import { Token } from "../../token";
import { PrefixParselet } from "../prefixParselet";

export class PreUnaryParselet implements PrefixParselet {
    private precedence: number;

    constructor(precedence: number) {
        this.precedence = precedence;
    }

    parse(parser: Parser, token: Token): Expr {
        const rhs = parser.expressionPrec(this.precedence);
        return new UnaryExpr(token, rhs);
    }
}