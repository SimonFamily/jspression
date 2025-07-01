import { Expr, LiteralExpr } from "../../../ir/expr";
import { Parser } from "../../parser";
import { Token } from "../../token";
import { PrefixParselet } from "../prefixParselet";

export class LiteralParselet implements PrefixParselet {
    parse(parser: Parser, token: Token): Expr {
        return new LiteralExpr(token.literal);
    }
}