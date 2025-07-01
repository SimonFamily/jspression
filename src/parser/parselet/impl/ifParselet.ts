import { Expr, IfExpr } from "../../../ir/expr";
import { Parser } from "../../parser";
import { Precedence } from "../../precedence";
import { Token } from "../../token";
import { TokenType } from "../../tokenType";
import { PrefixParselet } from "../prefixParselet";

export class IfParselet implements PrefixParselet {
    parse(parser: Parser, token: Token): Expr {
        parser.consume(TokenType.LEFT_PAREN, "Expect '(' after if.");
        const condition = parser.expressionPrec(Precedence.PREC_NONE);
        parser.consume(TokenType.COMMA, "Expect ',' after condition expression.");
        const thenExpr = parser.expressionPrec(Precedence.PREC_NONE);
        
        let elseExpr: Expr | null = null;
        if (parser.match(TokenType.COMMA)) {
            elseExpr = parser.expressionPrec(Precedence.PREC_NONE);
        }
        
        parser.consume(TokenType.RIGHT_PAREN, "Expect ')' at end of if expression.");
        return new IfExpr(condition, thenExpr, elseExpr);
    }
}