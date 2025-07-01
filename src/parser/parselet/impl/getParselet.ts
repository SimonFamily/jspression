import { Expr, GetExpr } from "../../../ir/expr";
import { Parser } from "../../parser";
import { Token } from "../../token";
import { TokenType } from "../../tokenType";
import { InfixParselet } from "../infixParselet";

export class GetParselet implements InfixParselet {
    private precedence: number;

    constructor(precedence: number) {
        this.precedence = precedence;
    }

    parse(parser: Parser, lhs: Expr, token: Token): Expr {
        const name = parser.consume(TokenType.IDENTIFIER, "Expect property name after '.'.");
        return new GetExpr(lhs, name);
    }

    getPrecedence(): number {
        return this.precedence;
    }
}