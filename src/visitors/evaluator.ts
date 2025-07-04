import { Environment } from '../env/environment';
import { Value } from '../values/value';
import { ValuesHelper } from '../values/valuesHelper';
import { TokenType } from '../parser/tokenType';
import { LoxRuntimeError } from '../loxRuntimeError';
import { Function } from '../functions/function';
import { FunctionManager } from '../functions/functionManager';
import { Token } from '../parser/token';
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
    SetExpr 
} from '../ir/expr';
import { Visitor } from './visitor';
import { Parser } from '../parser/parser';

// 表达式求值器
export class Evaluator implements Visitor<Value> {
    private env: Environment;

    constructor(env: Environment) {
        this.env = env;
    }
    
    public executeAll(exprs: Expr[] | null): Value[] {
        if (!exprs || exprs.length === 0) return [];

        const results: Value[] = [];
        for (const expr of exprs) {
            results.push(this.execute(expr));
        }
        return results;
    }

    public executeSrc(src: string): Value {
        if (!src || src.trim() === "") return null; // 如果源代码为空或仅包含空格，返回null 
        const p = new Parser(src);
        const expr = p.parse();
        return this.execute(expr);
    }
    
    public execute(expr: Expr): Value {
        if (expr) return expr.accept(this);
        return null;
    }

    visitBinary(expr: BinaryExpr): Value {
        const left = this.execute(expr.left);
        const right = this.execute(expr.right);
        return ValuesHelper.binaryOperate(left, right, expr.operator.type);
    }
    
    visitLogic(expr: LogicExpr): Value {
        const left = this.execute(expr.left);
        if (expr.operator.type === TokenType.OR) {
            if (left.isTruthy()) {
                return new Value(true);
            }
        } else {
            if (!left.isTruthy()) {
                return new Value(false);
            }
        }
        return this.execute(expr.right);
    }

    visitLiteral(expr: LiteralExpr): Value {
        return expr.value;
    }

    visitUnary(expr: UnaryExpr): Value {
        const right = this.execute(expr.right);
        return ValuesHelper.preUnaryOperate(right, expr.operator.type);
    }

    visitId(expr: IdExpr): Value {
        return this.getVariableValue(expr.id);
    }
    
    visitAssign(expr: AssignExpr): Value {
        const right = this.execute(expr.right);
        if (expr.left instanceof IdExpr) {
            const idExpr = expr.left as IdExpr;
            this.env.putValue(idExpr.id, right);
            return right;
        }
        throw new LoxRuntimeError("Invalid assignment target");
    }
    
    visitCall(expr: CallExpr): Value {
        const callee = expr.callee;
        let functionName = "";
        
        if (callee instanceof IdExpr) {
            functionName = (callee as IdExpr).id;
        } else {
            throw new LoxRuntimeError(expr.rParen, "Can only call named functions");
        }
        
        const func = FunctionManager.getInstance().getFunction(functionName);
        if (!func) {
            throw new LoxRuntimeError(expr.rParen, `Function not found: ${functionName}`);
        }
        
        // 执行所有参数表达式
        const args: Value[] = [];
        for (const argExpr of expr.args) {
            args.push(this.execute(argExpr));
        }
        
        // 检查参数数量
        if (args.length !== func.arity()) {
            throw new LoxRuntimeError(
                expr.rParen,
                `Expected ${func.arity()} arguments but got ${args.length}.`
            );
        }
        
        return func.call(args);
    }
    
    visitIf(expr: IfExpr): Value {
        const condition = this.execute(expr.condition);
        if (condition.isTruthy()) {
            return this.execute(expr.thenBranch);
        } else if (expr.elseBranch !== null) {
            return this.execute(expr.elseBranch);
        }
        return new Value(); // 空值
    }
    
    visitGet(expr: GetExpr): Value {
        const object = this.execute(expr.object);
        if (object.isInstance()) {
            return object.asInstance().get(expr.name.lexeme);
        }
        throw new LoxRuntimeError(expr.name, "Only instances have properties.");
    }
    
    visitSet(expr: SetExpr): Value {
        const object = this.execute(expr.object);
        if (!object.isInstance()) {
            throw new LoxRuntimeError(expr.name, "Only instances have fields.");
        }

        const value = this.execute(expr.value);
        object.asInstance().set(expr.name.lexeme, value);
        return value;
    }
    
    private getVariableValue(id: string): Value {
        return this.env.getOrDefault(id, new Value());
    }
}