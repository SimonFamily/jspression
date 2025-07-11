import { JpRuntimeError } from "../jpRuntimeError";
import { TokenType } from "../parser/tokenType";
import { Value } from "./value";

export class ValuesHelper {
    static binaryOperate(left: Value, right: Value, type: TokenType): Value {
        switch (type) {
            case TokenType.PLUS:
                if ((!left.isNumber() && !left.isString()) || 
                    (!right.isNumber() && !right.isString())) {
                    throw new JpRuntimeError("Operands must be number or string.");
                }
                if (left.isString() || right.isString()) {
                    return new Value(left.toString() + right.toString());
                } else {
                    if (left.isDouble() || right.isDouble()) {
                        return new Value(left.asDouble() + right.asDouble(), false);
                    } else {
                        return new Value(left.asInteger() + right.asInteger());
                    }
                }
                
            case TokenType.MINUS:
                this.checkNumberOperands(left, right);
                if (left.isDouble() || right.isDouble()) {
                    return new Value(left.asDouble() - right.asDouble(), false);
                } else {
                    return new Value(left.asInteger() - right.asInteger());
                }
                
            case TokenType.STAR:
                this.checkNumberOperands(left, right);
                if (left.isDouble() || right.isDouble()) {
                    return new Value(left.asDouble() * right.asDouble(), false);
                } else {
                    return new Value(left.asInteger() * right.asInteger());
                }
                
            case TokenType.SLASH:
                this.checkNumberOperands(left, right);
                if (right.isInteger() && right.asInteger() === 0) {
                    throw new JpRuntimeError("Division by zero.");
                }
                if (left.isDouble() || right.isDouble()) {
                    return new Value(left.asDouble() / right.asDouble(), false);
                } else {
                    return new Value(Math.trunc(left.asInteger() / right.asInteger()));
                }
                
            case TokenType.PERCENT:
                this.checkNumberOperands(left, right);
                if (left.isDouble() || right.isDouble()) {
                    return new Value(left.asDouble() % right.asDouble(), false);
                } else {
                    return new Value(left.asInteger() % right.asInteger());
                }
                
            case TokenType.STARSTAR:
                this.checkNumberOperands(left, right);
                return new Value(Math.pow(left.asDouble(), right.asDouble()), false);
                
            case TokenType.GREATER:
                this.checkNumberOperands(left, right);
                return new Value(left.asDouble() > right.asDouble());
                
            case TokenType.GREATER_EQUAL:
                this.checkNumberOperands(left, right);
                return new Value(left.asDouble() >= right.asDouble());
                
            case TokenType.LESS:
                this.checkNumberOperands(left, right);
                return new Value(left.asDouble() < right.asDouble());
                
            case TokenType.LESS_EQUAL:
                this.checkNumberOperands(left, right);
                return new Value(left.asDouble() <= right.asDouble());
                
            case TokenType.BANG_EQUAL:
                return new Value(!left.equals(right));
                
            case TokenType.EQUAL_EQUAL:
                return new Value(left.equals(right));
                
            default:
                return new Value(); // Null value
        }
    }

    static preUnaryOperate(operand: Value, type: TokenType): Value {
        switch (type) {
            case TokenType.BANG:
                const truthy = operand != null && operand.isTruthy();
                return new Value(!truthy);
                
            case TokenType.MINUS:
                this.checkNumberOperand(operand);
                if (operand.isInteger()) {
                    return new Value(-operand.asInteger());
                } else {
                    return new Value(-operand.asDouble(), false);
                }
                
            default:
                return new Value(); // Null value
        }
    }

    private static checkNumberOperand(operand: Value): void {
        if (operand != null && operand.isNumber()) {
            return;
        }
        throw new JpRuntimeError("Operand must be a number.");
    }

    private static checkNumberOperands(left: Value, right: Value): void {
        if (left.isNumber() && right.isNumber()) {
            return;
        }
        throw new JpRuntimeError(`Operands must be numbers. left: ${left}, right: ${right}`);
    }
}