import { Tracer } from "./tracer";
import { ExecuteContext } from "./ir/executeContext";
import { ExprInfo } from "./ir/exprInfo";

export class LoxContext {
    private readonly tracer: Tracer;
    private readonly execContext: ExecuteContext;

    constructor() {
        this.tracer = new Tracer();
        this.execContext = new ExecuteContext(this);
    }
    
    public getTracer(): Tracer {
        return this.tracer;
    }
    
    public getExecContext(): ExecuteContext {
        return this.execContext;
    }
    
    public prepareExecute(exprInfos: ExprInfo[]): void {
        this.execContext.preExecute(exprInfos);
    }
}