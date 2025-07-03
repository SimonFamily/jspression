import { ExecuteMode } from "./executeMode";
import { LoxContext } from "./loxContext";
import { Environment } from "./env/environment";
import { DefaultEnvironment } from "./env/defaultEnvironment";
import { ExprInfo } from "./ir/exprInfo";
import { Evaluator } from "./visitors/evaluator";
import { Chunk } from "./execution/chunk/chunk";
import { ChunkReader } from "./execution/chunk/chunkReader";
import { VM } from "./execution/vm";
import { Expr } from "./ir/expr";
import { Parser } from "./parser/parser";
import { OpCodeCompiler } from "./visitors/opCodeCompiler";
import { ExprSorter } from "./ir/exprSorter";
import { Field } from "./field";

export class LoxRunner {
    private needSort: boolean;
    private executeMode: ExecuteMode = ExecuteMode.SyntaxTree;
    private context: LoxContext;

    constructor() {
        this.needSort = true;
        this.context = new LoxContext();
    }

    public isNeedSort(): boolean {
        return this.needSort;
    }

    public setNeedSort(needSort: boolean): void {
        this.needSort = needSort;
    }

    public isTrace(): boolean {
        return this.context.getTracer().isEnable();
    }

    public setTrace(isTrace: boolean): void {
        this.context.getTracer().setEnable(isTrace);
    }

    public getExecuteMode(): ExecuteMode {
        return this.executeMode;
    }

    public setExecuteMode(executeMode: ExecuteMode): void {
        this.executeMode = executeMode;
    }

    public execute(expression: string, env?: Environment): any {
        if (!env) {
            env = new DefaultEnvironment();
        }
        const result = this.executeBatch([expression], env);
        return result === null ? null : result[0];
    }

    public executeBatch(expressions: string[], env?: Environment): any[] | null {
        if (!env) {
            env = new DefaultEnvironment();
        }
        const tracer = this.context.getTracer();
        tracer.startTimer(`开始。公式总数：${expressions.length}`);
        
        const exprs = this.parse(expressions);
        const exprInfos = this.analyze(exprs);
        
        let result: any[] | null = null;
        if (this.executeMode === ExecuteMode.ChunkVM) {
            const chunk = this.compileIR(exprInfos);
            result = this.runChunk(chunk, env);
        } else {
            result = this.runIR(exprInfos, env);
        }
        
        tracer.endTimer("结束。");
        return result;
    }

    public runIR(exprInfos: ExprInfo[], env: Environment): any[] | null {
        const tracer = this.context.getTracer();
        tracer.startTimer();
        
        const variables = new Set<string>();
        exprInfos.forEach(info => {
            info.getPrecursors().forEach(v => variables.add(v));
            info.getSuccessors().forEach(v => variables.add(v));
        });
        
        const fields = this.getFields(Array.from(variables));
        const flag = env.beforeExecute(fields);
        
        tracer.endTimer("完成执行环境初始化。");
        if (!flag) return null;
        
        tracer.startTimer("执行");
        const n = exprInfos.length;
        const result: any[] = new Array(n);
        
        exprInfos.forEach(info => {
            const expr = info.getExpr();
            const evaluator = new Evaluator(env);
            const v = evaluator.execute(expr);
            result[info.getIndex()] = v.getValue();
        });
        
        tracer.endTimer("执行完成。");
        return result;
    }

    public runChunk(chunk: Chunk, env: Environment): any[] | null {
        const tracer = this.context.getTracer();
        tracer.startTimer();
        
        const chunkReader = new ChunkReader(chunk, tracer);
        const variables = Array.from(chunkReader.getVariables());
        const fields = this.getFields(variables);
        const flag = env.beforeExecute(fields);
        
        tracer.endTimer("完成执行环境初始化。");
        if (!flag) return null;
        
        tracer.startTimer("执行");
        const vm = new VM(tracer);
        const exResults = vm.execute(chunkReader, env);
        const result = new Array(exResults.length);
        
        exResults.forEach(res => {
            result[res.getIndex()] = res.getResult().getValue();
        });
        
        tracer.endTimer("执行完成。");
        return result;
    }

    public parse(expressions: string[]): Expr[] {
        const tracer = this.context.getTracer();
        tracer.startTimer("解析");
        
        const result: Expr[] = [];
        expressions.forEach(src => {
            const parser = new Parser(src);
            result.push(parser.parse());
        });
        
        tracer.endTimer("完成表达式解析。");
        return result;
    }

    public analyze(exprs: Expr[]): ExprInfo[] {
        const tracer = this.context.getTracer();
        tracer.startTimer("分析");
        
        const exprInfos: ExprInfo[] = exprs.map((expr, i) => 
            new ExprInfo(expr, i)
        );
        
        this.context.prepareExecute(exprInfos);
        const sortedInfos = this.sortExprs(exprInfos);
        
        tracer.endTimer("完成表达式分析。");
        return sortedInfos;
    }

    public compileSource(expressions: string[]): Chunk {
        const tracer = this.context.getTracer();
        tracer.startTimer("编译源码");
        
        const exprs = this.parse(expressions);
        const exprInfos = this.analyze(exprs);
        const chunk = this.compileIR(exprInfos);
        
        tracer.endTimer("完成表达式编译。");
        return chunk;
    }

    public compileIR(exprInfos: ExprInfo[]): Chunk {
        const tracer = this.context.getTracer();
        tracer.startTimer("编译中间表示");
        
        const compiler = new OpCodeCompiler(tracer, exprInfos.length);
        compiler.beginCompile();
        
        exprInfos.forEach(info => {
            compiler.compile(info);
        });
        
        const result = compiler.endCompile();
        tracer.endTimer("完成表达式编译。");
        return result;
    }

    private sortExprs(exprInfos: ExprInfo[]): ExprInfo[] {
        if (this.needSort && 
            exprInfos.length >= 1 && 
            this.context.getExecContext().hasAssign()) {
            const sorter = new ExprSorter(this.context);
            return sorter.sort();
        }
        return exprInfos;
    }

    private getFields(strs: string[]): Field[] {
        return strs.map(str => Field.valueOf(str));
    }
}