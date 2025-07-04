import { Environment } from "../env/environment";
import { FunctionManager } from "../functions/functionManager";
import { JpRuntimeError } from "../jpRuntimeError";
import { TokenType } from "../parser/tokenType";
import { Tracer } from "../tracer";
import { Value } from "../values/value";
import { ValuesHelper } from "../values/valuesHelper";
import { Chunk } from "./chunk/chunk";
import { ChunkReader } from "./chunk/chunkReader";
import { ExResult } from "./exResult";
import { ExState } from "./exState";
import { OpCode } from "./opCode";

// 虚拟机实现
export class VM {
    private static readonly STACK_MAX = 256;
    
    private stack: (Value | null)[];
    private stackTop: number;
    private chunkReader: ChunkReader | null;
    private tracer: Tracer;

    constructor(tracer: Tracer) {
        this.tracer = tracer;
        this.stack = new Array(VM.STACK_MAX).fill(null);
        this.stackTop = 0;
        this.chunkReader = null;
    }

    private reset(): void {
        this.stackTop = 0;
        this.chunkReader = null;
        this.stack.fill(null);
    }

    private push(value: Value): void {
        if (this.stackTop >= VM.STACK_MAX) {
            throw new JpRuntimeError("Stack overflow");
        }
        this.stack[this.stackTop++] = value;
    }

    private pop(): Value {
        if (this.stackTop <= 0) {
            throw new JpRuntimeError("Stack underflow");
        }
        return this.stack[--this.stackTop];
    }

    private peek(): Value {
        if (this.stackTop <= 0) {
            throw new JpRuntimeError("Stack underflow");
        }
        return this.stack[this.stackTop - 1];
    }

    private peekAt(distance: number): Value {
        if (this.stackTop - 1 - distance < 0) {
            throw new JpRuntimeError("Invalid stack access");
        }
        return this.stack[this.stackTop - 1 - distance];
    }
    
    execute(chunk: Chunk | ChunkReader, env: Environment): ExResult[] {
        if (chunk instanceof Chunk) {
            chunk = new ChunkReader(chunk, this.tracer);
        }
        this.reset();
        this.chunkReader = chunk;
        return this.run(env);
    }

    private run(env: Environment): ExResult[] {
        this.tracer.startTimer("运行虚拟机");
        const result: ExResult[] = [];
        let expOrder = 0;
        
        for (;;) {
            const op = this.readCode();
            
            try {
                switch (op) {
                    case OpCode.OP_BEGIN:
                        expOrder = this.readInt();
                        break;
                    
                    case OpCode.OP_END: {
                        const v = this.pop();
                        const res = new ExResult(v, ExState.OK);
                        res.setIndex(expOrder);
                        result.push(res);
                        break;
                    }
                    
                    case OpCode.OP_CONSTANT:
                        this.push(this.readConstant());
                        break;
                    
                    case OpCode.OP_POP:
                        this.pop();
                        break;
                    
                    case OpCode.OP_NULL:
                        this.push(new Value());
                        break;
                    
                    case OpCode.OP_GET_GLOBAL: {
                        const name = this.readString();
                        const v = env.getOrDefault(name, new Value());
                        this.push(v);
                        break;
                    }
                    
                    case OpCode.OP_SET_GLOBAL: {
                        const name = this.readString();
                        const value = this.peek();
                        if (value !== null) {
                            env.putValue(name, value);
                        }
                        break;
                    }
                    
                    case OpCode.OP_GET_PROPERTY: {
                        const name = this.readString();
                        const object = this.pop();
                        if (object === null || !object.isInstance()) {
                            throw new JpRuntimeError(`Only instances have properties. error: ${name}`);
                        }
                        this.push(object.asInstance().get(name));
                        break;
                    }
                    
                    case OpCode.OP_SET_PROPERTY: {
                        const name = this.readString();
                        const object = this.pop();
                        if (object === null || !object.isInstance()) {
                            throw new JpRuntimeError(`Only instances have properties. error: ${name}`);
                        }
                        const value = this.peek();
                        if (value !== null) {
                            object.asInstance().set(name, value);
                        }
                        break;
                    }
                    
                    case OpCode.OP_ADD:
                        this.binaryOp(TokenType.PLUS);
                        break;
                    
                    case OpCode.OP_SUBTRACT:
                        this.binaryOp(TokenType.MINUS);
                        break;
                    
                    case OpCode.OP_MULTIPLY:
                        this.binaryOp(TokenType.STAR);
                        break;
                    
                    case OpCode.OP_DIVIDE:
                        this.binaryOp(TokenType.SLASH);
                        break;
                    
                    case OpCode.OP_MODE:
                        this.binaryOp(TokenType.PERCENT);
                        break;
                    
                    case OpCode.OP_POWER:
                        this.binaryOp(TokenType.STARSTAR);
                        break;
                    
                    case OpCode.OP_GREATER:
                        this.binaryOp(TokenType.GREATER);
                        break;
                    
                    case OpCode.OP_GREATER_EQUAL:
                        this.binaryOp(TokenType.GREATER_EQUAL);
                        break;
                    
                    case OpCode.OP_LESS:
                        this.binaryOp(TokenType.LESS);
                        break;
                    
                    case OpCode.OP_LESS_EQUAL:
                        this.binaryOp(TokenType.LESS_EQUAL);
                        break;
                    
                    case OpCode.OP_EQUAL_EQUAL:
                        this.binaryOp(TokenType.EQUAL_EQUAL);
                        break;
                    
                    case OpCode.OP_BANG_EQUAL:
                        this.binaryOp(TokenType.BANG_EQUAL);
                        break;
                    
                    case OpCode.OP_NOT:
                        this.preUnaryOp(TokenType.BANG);
                        break;
                    
                    case OpCode.OP_NEGATE:
                        this.preUnaryOp(TokenType.MINUS);
                        break;
                    
                    case OpCode.OP_CALL: {
                        const name = this.readString();
                        this.callFunction(name);
                        break;
                    }
                    
                    case OpCode.OP_JUMP_IF_FALSE: {
                        const offset = this.readInt();
                        const condition = this.peek();
                        if (condition === null || !condition.isTruthy()) {
                            this.gotoOffset(offset);
                        }
                        break;
                    }
                    
                    case OpCode.OP_JUMP: {
                        const offset = this.readInt();
                        this.gotoOffset(offset);
                        break;
                    }
                    
                    case OpCode.OP_RETURN:
                        // 返回操作，暂时不做处理
                        break;
                    
                    case OpCode.OP_EXIT:
                        this.tracer.endTimer("虚拟机运行结束");
                        if (this.stackTop !== 0) {
                            throw new JpRuntimeError(`虚拟机状态异常，栈顶位置为：${this.stackTop}`);
                        }
                        return result;
                    
                    default:
                        throw new JpRuntimeError(`暂不支持的指令：${op.getTitle()}`);
                }
            } catch (e) {
                this.tracer.endTimer("虚拟机运行异常终止");
                if (e instanceof JpRuntimeError) {
                    // 创建错误结果
                    const errorResult = new ExResult(null, ExState.ERROR);
                    errorResult.setIndex(expOrder);
                    errorResult.setError(e.message);
                    result.push(errorResult);
                    
                    // 跳过当前表达式，寻找下一个 BEGIN
                    this.skipToNextExpression();
                } else {
                    // 重新抛出非预期错误
                    throw e;
                }
            }
        }
    }
    
    private skipToNextExpression(): void {
        if (!this.chunkReader) return;
        
        let depth = 0;
        while (this.chunkReader.remaining() > 0) {
            const op = this.readCode();
            
            if (op === OpCode.OP_BEGIN) {
                if (depth === 0) {
                    // 回退一个操作码，以便下次执行能正确处理 BEGIN
                    this.chunkReader.newPosition(this.chunkReader.position() - 1);
                    return;
                }
                depth++;
            } else if (op === OpCode.OP_END) {
                if (depth > 0) {
                    depth--;
                } else {
                    // 找到匹配的 END
                    return;
                }
            }
        }
    }
    
    private callFunction(name: string): void {
        const func = FunctionManager.getInstance().getFunction(name);
        const cnt = func.arity();
        const args: Value[] = [];
        
        // 从栈中弹出参数（逆序）
        for (let i = cnt - 1; i >= 0; i--) {
            const arg = this.pop();
            if (arg !== null) {
                args[i] = arg;
            } else {
                args[i] = new Value();
            }
        }
        
        // 调用函数
        const result = func.call(args);
        this.push(result);
    }

    private binaryOp(type: TokenType): void {
        const b = this.pop();
        const a = this.pop();
        
        if (a === null || b === null) {
            throw new JpRuntimeError("Operands cannot be null");
        }
        
        const result = ValuesHelper.binaryOperate(a, b, type);
        this.push(result);
    }
    
    private preUnaryOp(type: TokenType): void {
        const operand = this.pop();
        
        if (operand === null) {
            throw new JpRuntimeError("Operand cannot be null");
        }
        
        const result = ValuesHelper.preUnaryOperate(operand, type);
        this.push(result);
    }

    private readString(): string {
        const value = this.readConstant();
        if (value === null || !value.isString()) {
            throw new JpRuntimeError("Expected string constant");
        }
        return value.asString();
    }

    private readConstant(): Value | null {
        const index = this.readInt();
        if (!this.chunkReader) {
            throw new JpRuntimeError("No active chunk reader");
        }
        return this.chunkReader.readConst(index);
    }
    
    private readCode(): OpCode {
        const code = this.readByte();
        const opCode = OpCode.forValue(code);
        if (!opCode) {
            throw new JpRuntimeError(`Unknown opcode: ${code}`);
        }
        return opCode;
    }

    private readByte(): number {
        if (!this.chunkReader) {
            throw new JpRuntimeError("No active chunk reader");
        }
        return this.chunkReader.readByte();
    }
    
    private readInt(): number {
        if (!this.chunkReader) {
            throw new JpRuntimeError("No active chunk reader");
        }
        return this.chunkReader.readInt();
    }
    
    private gotoOffset(offset: number): void {
        if (!this.chunkReader) {
            throw new JpRuntimeError("No active chunk reader");
        }
        const curPos = this.chunkReader.position();
        this.chunkReader.newPosition(curPos + offset);
    }
}