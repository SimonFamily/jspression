import { JpContext } from "../jpContext";
import { JpRuntimeError } from "../jpRuntimeError";
import { Digraph } from "../util/digraph";
import { Node } from "../util/node";
import { NodeSet } from "../util/nodeSet";
import { TopologicalSort } from "../util/topologicalSort";
import { ExprInfo } from "./exprInfo";

export class ExprSorter {
    private nodeSet: NodeSet<ExprInfo> | null;
    private graph: Digraph | null;
    private context: JpContext;
    
    constructor(context: JpContext) {
        this.context = context;
        this.nodeSet = context.getExecContext().getNodeSet();
        this.graph = context.getExecContext().getGraph();
    }
    
    public sort(): ExprInfo[] | null {
        if (!this.graph || this.graph.V() === 0) return null;
        
        const tracer = this.context.getTracer();
        tracer.startTimer("开始拓扑排序");
        
        const topSorter = new TopologicalSort(this.graph);
        const hasOrder = topSorter.sort();
        
        if (!hasOrder) {
            this.printCircle(); // 可选：打印循环引用信息
            throw new JpRuntimeError("公式列表存在循环引用！");
        }
        
        const nodeOrders = topSorter.getOrders();
        if (!nodeOrders) return null;
        
        const result: ExprInfo[] = [];
        
        // 添加所有赋值表达式（按拓扑顺序）
        for (const nodeIndex of nodeOrders) {
            const node = this.nodeSet.getNode(nodeIndex);
            if (node.info) {
                result.push(node.info);
            }
        }
        
        // 添加所有非赋值表达式（保持原始顺序）
        const origInfos = this.context.getExecContext().getExprInfos();
        for (const expr of origInfos) {
            if (!expr.isAssign()) {
                result.push(expr);
            }
        }
        
        tracer.endTimer("完成拓扑排序");
        return result;
    }
    
    private printCircle(): void {
        // TODO: 实现循环引用检测和报告
        console.error("检测到循环引用");
    }
}