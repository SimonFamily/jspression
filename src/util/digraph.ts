export class Digraph {
    private readonly _V: number;
    private _E: number = 0;
    private readonly _adj: number[][];
    private readonly _indegree: number[];

    constructor(V: number) {
        if (V < 0) {
            throw new Error("Number of vertices in a Digraph must be non-negative");
        }
        
        this._V = V;
        this._indegree = new Array(V).fill(0);
        this._adj = new Array(V);
        
        for (let v = 0; v < V; v++) {
            this._adj[v] = [];
        }
    }
    
    public V(): number {
        return this._V;
    }

    public E(): number {
        return this._E;
    }

    private validateVertex(v: number): void {
        if (v < 0 || v >= this._V) {
            throw new Error(`vertex ${v} is not between 0 and ${this._V - 1}`);
        }
    }

    public addEdge(v: number, w: number): void {
        this.validateVertex(v);
        this.validateVertex(w);
        
        this._adj[v].push(w);
        this._indegree[w]++;
        this._E++;
    }

    public adj(v: number): number[] {
        this.validateVertex(v);
        return [...this._adj[v]]; // 返回副本以避免外部修改
    }

    public outdegree(v: number): number {
        this.validateVertex(v);
        return this._adj[v].length;
    }

    public indegree(v: number): number {
        this.validateVertex(v);
        return this._indegree[v];
    }

    public reverse(): Digraph {
        const reverse = new Digraph(this._V);
        
        for (let v = 0; v < this._V; v++) {
            for (const w of this._adj[v]) {
                reverse.addEdge(w, v);
            }
        }
        
        return reverse;
    }

    public toString(): string {
        let s = `${this._V} vertices, ${this._E} edges\n`;
        
        for (let v = 0; v < this._V; v++) {
            s += `${v}: `;
            s += this._adj[v].join(" ") + "\n";
        }
        
        return s;
    }
}