import { LoxContext } from "../loxContext";
import { Digraph } from "../util/digraph";
import { Node } from "../util/node";
import { NodeSet } from "../util/nodeSet";
import { ExprInfo } from "./exprInfo";

export class ExecuteContext {
    private exprInfos: ExprInfo[] = [];
    private nodeSet: NodeSet<ExprInfo> | null = null;
    private graph: Digraph | null = null;
    private global: LoxContext;
    
    constructor(global: LoxContext) {
        this.global = global;
    }

    public getExprInfos(): ExprInfo[] {
        return [...this.exprInfos]; // 返回副本防止外部修改
    }
    
    public getNodeSet(): NodeSet<ExprInfo> | null {
        return this.nodeSet;
    }
    
    public getGraph(): Digraph | null {
        return this.graph;
    }
    
    public hasAssign(): boolean {
        return this.graph !== null && this.graph.V() > 0;
    }
    
    public preExecute(exprInfos: ExprInfo[]): void {
        this.nodeSet = new NodeSet<ExprInfo>();
        this.exprInfos = [...exprInfos]; // 创建副本
        this.initNodes();
        this.initGraph();
    }
    
    private initNodes(): void {
        const tracer = this.global.getTracer();
        tracer.startTimer("开始图节点初始化");
        
        for (const exprInfo of this.exprInfos) {
            if (!exprInfo.isAssign()) { // 只对赋值表达式构造有向图
                continue;
            }
            
            // 添加依赖变量节点
            for (const name of exprInfo.getPrecursors()) {
                this.nodeSet!.addNode(name);
            }
            
            // 添加赋值变量节点并关联表达式
            let flag = true;
            for (const name of exprInfo.getSuccessors()) {
                const node = this.nodeSet!.addNode(name);
                if (flag) {
                    node.info = exprInfo;
                    flag = false;
                }
            }
        }
        
        tracer.endTimer("完成图节点初始化");
    }
    
    private initGraph(): void {
        const tracer = this.global.getTracer();
        tracer.startTimer("开始图构建");
        
        if (!this.nodeSet || this.nodeSet.size() === 0) {
            this.graph = null;
            tracer.endTimer("无赋值表达式，跳过图构建");
            return;
        }
        
        this.graph = new Digraph(this.nodeSet.size());
        
        for (const info of this.exprInfos) {
            if (!info.isAssign()) { // 只对赋值表达式构造有向图
                continue;
            }
            
            for (const prec of info.getPrecursors()) {
                const preNode = this.nodeSet.getNode(prec);
                if (!preNode) continue;
                
                const u = preNode.index;
                
                for (const succ of info.getSuccessors()) {
                    const succNode = this.nodeSet.getNode(succ);
                    if (!succNode) continue;
                    
                    const v = succNode.index;
                    this.graph.addEdge(u, v);
                }
            }
        }
        
        tracer.endTimer("完成图构建");
    }
    
    public printGraph(): string {
        if (!this.graph || !this.nodeSet) {
            return "Graph not initialized";
        }
        
        let s = "";
        s += `${this.graph.V()} vertices, ${this.graph.E()} edges\n`;
        
        for (let u = 0; u < this.graph.V(); u++) {
            const pre = this.nodeSet.getNode(u);
            if (!pre) continue;
            s += `${u}(${pre.name}-${this.graph.indegree(u)}): `;
            
            const neighbors = this.graph.adj(u);
            for (const v of neighbors) {
                const succ = this.nodeSet.getNode(v);
                if (!succ) continue;
                s += `${v}(${succ.name}) `;
            }
            
            s += "\n";
        }
        
        return s;
    }
}