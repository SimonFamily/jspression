import { InfixParselet } from '../infixParselet';
import { Expr, AssignExpr, GetExpr, SetExpr } from '../../../ir/expr';
import { Parser } from '../../parser';
import { Token } from '../../token';

export class AssignParselet implements InfixParselet {
    private precedence: number;

    constructor(precedence: number) {
        this.precedence = precedence;
    }

    parse(parser: Parser, lhs: Expr, token: Token): Expr {
        // 右结合，优先级降低一位，支持连续赋值
        const rhs = parser.expressionPrec(this.precedence - 1);
        
        if (lhs instanceof GetExpr) {
            return new SetExpr(lhs.object, lhs.name, rhs);
        }
        return new AssignExpr(lhs, token, rhs);
    }

    getPrecedence(): number {
        return this.precedence;
    }
}