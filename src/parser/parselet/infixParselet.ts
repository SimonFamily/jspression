import { Expr } from "../../ir/expr";
import { Parser } from "../parser";
import { Token } from "../token";

export interface InfixParselet {
    parse(parser: Parser, lhs: Expr, token: Token): Expr;
    getPrecedence(): number;
}