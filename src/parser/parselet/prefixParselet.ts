import { Expr } from "../../ir/expr";
import { Parser } from "../parser";
import { Token } from "../token";

export interface PrefixParselet {
    parse(parser: Parser, token: Token): Expr;
}