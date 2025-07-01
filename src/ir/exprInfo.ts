import { Expr, AssignExpr, SetExpr } from "./expr";
import { VarsQuery } from "../visitors/varsQuery";

export class ExprInfo {
    private precursors: Set<string> = new Set(); // 依赖的变量 read
    private successors: Set<string> = new Set(); // 被赋值的变量 write
    private expr: Expr;
    private index: number;

    constructor(expr: Expr, index: number) {
        this.expr = expr;
        this.index = index;
        this.initVariables();
    }
    
    private initVariables(): void {
        const varQuery = new VarsQuery();
        const varSet = varQuery.execute(this.expr);
        
        if (varSet) {
            this.precursors = new Set(varSet.getDepends());
            this.successors = new Set(varSet.getAssigns());
        }
    }
    
    public isAssign(): boolean {
        return this.expr instanceof AssignExpr || this.expr instanceof SetExpr;
    }

    public getPrecursors(): Set<string> {
        return new Set(this.precursors); // 返回副本防止外部修改
    }

    public setPrecursors(precursors: Set<string>): void {
        this.precursors = new Set(precursors);
    }

    public getSuccessors(): Set<string> {
        return new Set(this.successors); // 返回副本防止外部修改
    }

    public setSuccessors(successors: Set<string>): void {
        this.successors = new Set(successors);
    }

    public getExpr(): Expr {
        return this.expr;
    }

    public setExpr(expr: Expr): void {
        this.expr = expr;
        this.initVariables(); // 更新变量信息
    }

    public getIndex(): number {
        return this.index;
    }

    public setIndex(index: number): void {
        this.index = index;
    }
    
    public toString(): string {
        return `ExprInfo[${this.index}]: ${this.expr.constructor.name}`;
    }
}