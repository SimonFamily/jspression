import { CallExpr, Expr } from "../../../ir/expr";
import { LoxParseError } from "../../parseError";
import { Parser } from "../../parser";
import { Precedence } from "../../precedence";
import { Token } from "../../token";
import { TokenType } from "../../tokenType";
import { InfixParselet } from "../infixParselet";

export class CallParselet implements InfixParselet {
    private precedence: number;

    constructor(precedence: number) {
        this.precedence = precedence;
    }

    parse(parser: Parser, lhs: Expr, token: Token): Expr {
        const args: Expr[] = [];
        let argCount = 0;

        if (!parser.check(TokenType.RIGHT_PAREN)) {
            do {
                if (argCount >= 255) {
                    throw new LoxParseError(parser.peek(), "Can't have more than 255 arguments.");
                }
                const arg = parser.expressionPrec(Precedence.PREC_NONE);
                args.push(arg);
                argCount++;
            } while (parser.match(TokenType.COMMA));
        }

        const rParen = parser.consume(TokenType.RIGHT_PAREN, "Expect ')' after arguments.");
        return new CallExpr(lhs, args, rParen);
    }

    getPrecedence(): number {
        return this.precedence;
    }
}