import { Chunk } from "../execution/chunk/chunk";
import { ChunkWriter } from "../execution/chunk/chunkWriter";
import { OpCode } from "../execution/opCode";
import { FunctionManager } from "../functions/functionManager";
import { AssignExpr, BinaryExpr, CallExpr, Expr, GetExpr, IdExpr, IfExpr, LiteralExpr, LogicExpr, SetExpr, UnaryExpr } from "../ir/expr";
import { ExprInfo } from "../ir/exprInfo";
import { JpRuntimeError } from "../jpRuntimeError";
import { TokenType } from "../parser/tokenType";
import { Tracer } from "../tracer";
import { Value } from "../values/value";
import { Visitor } from "./visitor";

const ADDRESSSIZE = 4;

export class OpCodeCompiler implements Visitor<void> {
    private chunkWriter: ChunkWriter;
    private varSet: Set<string> = new Set();
    private tracer: Tracer;

    constructor(tracer: Tracer, chunkCapacity?: number) {
        this.tracer = tracer;
        this.chunkWriter = chunkCapacity !== undefined 
            ? new ChunkWriter(chunkCapacity, tracer) 
            : new ChunkWriter(tracer);
    }

    public beginCompile(): void {
        this.chunkWriter.clear();
        this.varSet.clear();
    }

    public compile(exprInfo: ExprInfo): void {
        const expr = exprInfo.getExpr();
        const order = exprInfo.getIndex();
        this.compileExpr(expr, order);
        exprInfo.getPrecursors().forEach(v => this.varSet.add(v));
        exprInfo.getSuccessors().forEach(v => this.varSet.add(v));
    }

    public compileExpr(expr: Expr, order: number = 0): void {
        this.emitOp(OpCode.OP_BEGIN, order);
        this.execute(expr);
        this.emitOp(OpCode.OP_END);
    }

    public endCompile(): Chunk {
        this.emitOp(OpCode.OP_EXIT);
        const vars: string[] = []
        for (var name of this.varSet) vars.push(name)
        this.chunkWriter.setVariables(vars);
        return this.chunkWriter.flush();
    }

    private execute(expr: Expr | null): void {
        if (expr !== null) {
            expr.accept(this);
        }
    }

    public visitBinary(expr: BinaryExpr): void {
        this.execute(expr.left);
        this.execute(expr.right);
        switch (expr.operator.type) {
            case TokenType.PLUS:
                this.emitOp(OpCode.OP_ADD);
                break;
            case TokenType.MINUS:
                this.emitOp(OpCode.OP_SUBTRACT);
                break;
            case TokenType.STAR:
                this.emitOp(OpCode.OP_MULTIPLY);
                break;
            case TokenType.SLASH:
                this.emitOp(OpCode.OP_DIVIDE);
                break;
            case TokenType.PERCENT:
                this.emitOp(OpCode.OP_MODE);
                break;
            case TokenType.STARSTAR:
                this.emitOp(OpCode.OP_POWER);
                break;
            case TokenType.GREATER:
                this.emitOp(OpCode.OP_GREATER);
                break;
            case TokenType.GREATER_EQUAL:
                this.emitOp(OpCode.OP_GREATER_EQUAL);
                break;
            case TokenType.LESS:
                this.emitOp(OpCode.OP_LESS);
                break;
            case TokenType.LESS_EQUAL:
                this.emitOp(OpCode.OP_LESS_EQUAL);
                break;
            case TokenType.BANG_EQUAL:
                this.emitOp(OpCode.OP_BANG_EQUAL);
                break;
            case TokenType.EQUAL_EQUAL:
                this.emitOp(OpCode.OP_EQUAL_EQUAL);
                break;
            default:
                break;
        }
    }

    public visitLogic(expr: LogicExpr): void {
        this.execute(expr.left);
        if (expr.operator.type === TokenType.AND) {
            const jumper = this.emitJump(OpCode.OP_JUMP_IF_FALSE);
            this.emitOp(OpCode.OP_POP);
            this.execute(expr.right);
            this.patchJump(jumper);
        } else {
            const jumper1 = this.emitJump(OpCode.OP_JUMP_IF_FALSE);
            const jumper2 = this.emitJump(OpCode.OP_JUMP);
            this.patchJump(jumper1);
            this.emitOp(OpCode.OP_POP);
            this.execute(expr.right);
            this.patchJump(jumper2);
        }
    }

    public visitLiteral(expr: LiteralExpr): void {
        this.emitConstant(expr.value);
    }

    public visitUnary(expr: UnaryExpr): void {
        this.execute(expr.right);
        switch (expr.operator.type) {
            case TokenType.BANG:
                this.emitOp(OpCode.OP_NOT);
                break;
            case TokenType.MINUS:
                this.emitOp(OpCode.OP_NEGATE);
                break;
            default:
                break;
        }
    }

    public visitId(expr: IdExpr): void {
        const constant = this.makeConstant(new Value(expr.id));
        this.emitOp(OpCode.OP_GET_GLOBAL, constant);
    }

    public visitAssign(expr: AssignExpr): void {
        this.execute(expr.right);
        const idExpr = expr.left as IdExpr;
        const constant = this.makeConstant(new Value(idExpr.id));
        this.emitOp(OpCode.OP_SET_GLOBAL, constant);
    }

    public visitCall(expr: CallExpr): void {
        const callee = expr.callee;
        const idExpr = callee as IdExpr;
        const name = idExpr?.id ?? "";
        const func = FunctionManager.getInstance().getFunction(name);
        if (!func) {
            throw new JpRuntimeError(expr.rParen, `Function undefined: ${name}`);
        }
        if (expr.args.length !== func.arity()) {
            throw new JpRuntimeError(
                expr.rParen,
                `Expected ${func.arity()} arguments but got ${expr.args.length}.`
            );
        }
        expr.args.forEach(arg => this.execute(arg));
        const constant = this.makeConstant(new Value(name));
        this.emitOp(OpCode.OP_CALL, constant);
    }

    public visitIf(expr: IfExpr): void {
        this.execute(expr.condition);
        const elseJumper = this.emitJump(OpCode.OP_JUMP_IF_FALSE);
        this.emitOp(OpCode.OP_POP);
        this.execute(expr.thenBranch);
        const endJumper = this.emitJump(OpCode.OP_JUMP);
        this.patchJump(elseJumper);
        this.emitOp(OpCode.OP_POP);
        if (expr.elseBranch) {
            this.execute(expr.elseBranch);
        } else {
            this.emitOp(OpCode.OP_NULL);
        }
        this.patchJump(endJumper);
    }

    public visitGet(expr: GetExpr): void {
        this.execute(expr.object);
        const constant = this.makeConstant(new Value(expr.name.lexeme!));
        this.emitOp(OpCode.OP_GET_PROPERTY, constant);
    }

    public visitSet(expr: SetExpr): void {
        this.execute(expr.value);
        this.execute(expr.object);
        const constant = this.makeConstant(new Value(expr.name.lexeme!));
        this.emitOp(OpCode.OP_SET_PROPERTY, constant);
    }

    private emitJump(jumpCode: OpCode): number {
        this.emitOp(jumpCode);
        this.emitInt(0xffffffff);
        return this.chunkWriter.position() - ADDRESSSIZE;
    }

    private patchJump(index: number): void {
        const offset = this.chunkWriter.position() - index - ADDRESSSIZE;
        this.chunkWriter.updateInt(index, offset);
    }

    private emitOp(opCode: OpCode, arg?: number): void {
        this.chunkWriter.writeByte(opCode.code);
        if (arg !== undefined) {
            this.emitInt(arg);
        }
    }

    private emitConstant(value: Value): void {
        const index = this.makeConstant(value);
        this.emitOp(OpCode.OP_CONSTANT, index);
    }

    private makeConstant(value: Value): number {
        return this.chunkWriter.addConstant(value);
    }

    private emitInt(value: number): void {
        this.chunkWriter.writeInt(value);
    }
}