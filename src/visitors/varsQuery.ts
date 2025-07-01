import {
    Expr,
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
import { VariableSet } from "./variableSet";
import { Visitor } from "./visitor";

export class VarsQuery implements Visitor<VariableSet> {

    public executeAll(exprs: Expr[] | null): (VariableSet | null)[] {
        if (!exprs || exprs.length === 0) return [];

        const results: (VariableSet | null)[] = [];
        for (const expr of exprs) {
            results.push(this.execute(expr));
        }
        return results;
    }
    
    public execute(expr: Expr): VariableSet {
        if (expr) return expr.accept(this);
        return null;
    }

    public visitBinary(expr: BinaryExpr): VariableSet | null {
        const result = this.execute(expr.left);
        const rhs = this.execute(expr.right);
        
        if (!result) return rhs;
        if (rhs) result.combine(rhs);
        return result;
    }

    public visitLogic(expr: LogicExpr): VariableSet | null {
        const result = this.execute(expr.left);
        const rhs = this.execute(expr.right);
        
        if (!result) return rhs;
        if (rhs) result.combine(rhs);
        return result;
    }

    public visitLiteral(expr: LiteralExpr): VariableSet | null {
        return null;
    }

    public visitUnary(expr: UnaryExpr): VariableSet | null {
        return this.execute(expr.right);
    }

    public visitId(expr: IdExpr): VariableSet | null {
        return VariableSet.fromDepends(expr.id);
    }

    public visitAssign(expr: AssignExpr): VariableSet | null {
        // 假设左侧是IdExpr（如原始Java代码）
        if (expr.left instanceof IdExpr) {
            const idExpr = expr.left as IdExpr;
            const result = VariableSet.fromAssigns(idExpr.id);
            const rhs = this.execute(expr.right);
            if (rhs) result.combine(rhs);
            return result;
        }
        
        // 处理非标识符左值（如属性赋值）
        const result = new VariableSet();
        const leftVars = this.execute(expr.left);
        if (leftVars) {
            result.setAssigns(leftVars.getDepends());
        }
        
        const rhs = this.execute(expr.right);
        if (rhs) result.combine(rhs);
        return result;
    }

    public visitCall(expr: CallExpr): VariableSet | null {
        const result = new VariableSet();
        
        // 处理被调用表达式
        const calleeVars = this.execute(expr.callee);
        if (calleeVars) result.combine(calleeVars);
        
        // 处理所有参数
        for (const arg of expr.args) {
            const argVars = this.execute(arg);
            if (argVars) result.combine(argVars);
        }
        
        return result;
    }
    
    public visitIf(expr: IfExpr): VariableSet | null {
        const result = new VariableSet();
        
        const conditionVars = this.execute(expr.condition);
        if (conditionVars) result.combine(conditionVars);
        
        const thenVars = this.execute(expr.thenBranch);
        if (thenVars) result.combine(thenVars);
        
        const elseVars = this.execute(expr.elseBranch);
        if (elseVars) result.combine(elseVars);
        
        return result;
    }
    
    public visitGet(expr: GetExpr): VariableSet | null {
        const names: string[] = [];
        this.visitGetRecursive(expr, names);
        const id = names.join(".");
        return VariableSet.fromDepends(id);
    }
    
    private visitGetRecursive(expr: Expr, names: string[]): void {
        if (expr instanceof IdExpr) {
            names.push(expr.id);
            return;
        }
        
        if (expr instanceof GetExpr) {
            this.visitGetRecursive(expr.object, names);
            names.push(expr.name.lexeme);
            return;
        }
        
        // 处理其他可能的表达式类型
        names.push("?");
    }
    
    public visitSet(expr: SetExpr): VariableSet | null {
        // 创建虚拟的GetExpr来获取属性路径
        const getExpr = new GetExpr(expr.object, expr.name);
        const gets = this.execute(getExpr);
        
        const result = new VariableSet();
        if (gets) {
            result.setAssigns(gets.getDepends());
        }
        
        const rhs = this.execute(expr.value);
        if (rhs) result.combine(rhs);
        
        return result;    
    }
}