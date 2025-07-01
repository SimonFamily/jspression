import {
    BinaryExpr,
    LogicExpr,
    LiteralExpr,
    UnaryExpr,
    IdExpr,
    AssignExpr,
    CallExpr,
    IfExpr,
    GetExpr,
    SetExpr,
} from "../ir/expr";

export interface Visitor<R> {
    visitBinary(expr: BinaryExpr): R;
    visitLogic(expr: LogicExpr): R;
    visitLiteral(expr: LiteralExpr): R;
    visitUnary(expr: UnaryExpr): R;
    visitId(expr: IdExpr): R;
    visitAssign(expr: AssignExpr): R;
    visitCall(expr: CallExpr): R;
    visitIf(expr: IfExpr): R;
    visitGet(expr: GetExpr): R;
    visitSet(expr: SetExpr): R;
}
