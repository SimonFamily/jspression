import { Expr } from "../../../ir/expr";
import { Parser } from "../../parser";
import { Precedence } from "../../precedence";
import { Token } from "../../token";
import { TokenType } from "../../tokenType";
import { PrefixParselet } from "../prefixParselet";

export class GroupParselet implements PrefixParselet {
    parse(parser: Parser, token: Token): Expr {
        const expr = parser.expressionPrec(Precedence.PREC_NONE);
        parser.consume(TokenType.RIGHT_PAREN, "Expect ')' after expression.");
        return expr;
    }
}