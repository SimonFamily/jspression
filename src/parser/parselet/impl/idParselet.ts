import { Expr, IdExpr } from "../../../ir/expr";
import { Parser } from "../../parser";
import { Token } from "../../token";
import { PrefixParselet } from "../prefixParselet";

export class IdParselet implements PrefixParselet {
    parse(parser: Parser, token: Token): Expr {
        return new IdExpr(token.lexeme);
    }
}