import { Token } from "../parser/token";
import { Value } from "../values/value";
import { Visitor } from "../visitors/visitor";

export abstract class Expr {
    public abstract accept<R>(visitor: Visitor<R>): R;
}

export class AssignExpr extends Expr {
    constructor(
        public readonly left: Expr,
        public readonly operator: Token,
        public readonly right: Expr
    ) {
        super();
    }

    public accept<R>(visitor: Visitor<R>): R {
        return visitor.visitAssign(this);
    }
}

export class BinaryExpr extends Expr {
    constructor(
        public readonly left: Expr,
        public readonly operator: Token,
        public readonly right: Expr
    ) {
        super();
    }

    public accept<R>(visitor: Visitor<R>): R {
        return visitor.visitBinary(this);
    }
}

export class CallExpr extends Expr {
    constructor(
        public readonly callee: Expr,
        public readonly args: Expr[],
        public readonly rParen: Token
    ) {
        super();
    }

    public accept<R>(visitor: Visitor<R>): R {
        return visitor.visitCall(this);
    }
}

export class GetExpr extends Expr {
    constructor(
        public readonly object: Expr,
        public readonly name: Token
    ) {
        super();
    }

    public accept<R>(visitor: Visitor<R>): R {
        return visitor.visitGet(this);
    }
}

export class IdExpr extends Expr {
    constructor(
        public readonly id: string
    ) {
        super();
    }

    public accept<R>(visitor: Visitor<R>): R {
        return visitor.visitId(this);
    }

    public toString(): string {
        return this.id;
    }
}

export class IfExpr extends Expr {
    constructor(
        public readonly condition: Expr,
        public readonly thenBranch: Expr,
        public readonly elseBranch: Expr
    ) {
        super();
    }

    public accept<R>(visitor: Visitor<R>): R {
        return visitor.visitIf(this);
    }
}

export class LiteralExpr extends Expr {
    constructor(
        public readonly value: Value
    ) {
        super();
    }

    public accept<R>(visitor: Visitor<R>): R {
        return visitor.visitLiteral(this);
    }

    public toString(): string {
        return this.value.toString();
    }
}

export class LogicExpr extends Expr {
    constructor(
        public readonly left: Expr,
        public readonly operator: Token,
        public readonly right: Expr
    ) {
        super();
    }

    public accept<R>(visitor: Visitor<R>): R {
        return visitor.visitLogic(this);
    }
}

export class SetExpr extends Expr {
    constructor(
        public readonly object: Expr,
        public readonly name: Token,
        public readonly value: Expr
    ) {
        super();
    }

    public accept<R>(visitor: Visitor<R>): R {
        return visitor.visitSet(this);
    }
}

export class UnaryExpr extends Expr {
    constructor(
        public readonly operator: Token,
        public readonly right: Expr
    ) {
        super();
    }

    public accept<R>(visitor: Visitor<R>): R {
        return visitor.visitUnary(this);
    }
}