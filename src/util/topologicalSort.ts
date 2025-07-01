import { Digraph } from "./digraph";

export class TopologicalSort {
    private g: Digraph;
    private indegree: number[];
    private order: number[];

    constructor(g: Digraph) {
        this.g = g;
        this.indegree = new Array(g.V()).fill(0);
        this.order = new Array(g.V());
    }

    public sort(): boolean {
        // 初始化入度数组
        for (let v = 0; v < this.g.V(); v++) {
            this.indegree[v] = this.g.indegree(v);
        }

        // 使用数组模拟队列
        const queue: number[] = [];
        for (let v = 0; v < this.g.V(); v++) {
            if (this.indegree[v] === 0) {
                queue.push(v);
            }
        }

        let count = 0;
        while (queue.length > 0) {
            const u = queue.shift()!; // 非空断言，因为队列长度已检查
            this.order[count++] = u;
            
            for (const v of this.g.adj(u)) {
                this.indegree[v]--;
                if (this.indegree[v] === 0) {
                    queue.push(v);
                }
            }
        }

        if (count !== this.g.V()) {
            this.order = new Array(0);
            return false;
        }
        
        return true;
    }

    public hasOrder(): boolean {
        return this.order && this.order.length > 0;
    }

    public getOrders(): number[] {
        return this.order;
    }

    public toString(): string {
        if (this.order === null) return "null";
        
        const parts = this.order.map(v => v.toString());
        return `[${parts.join(",")}]`;
    }
}