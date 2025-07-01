import { Node } from "./node";

export class NodeSet<T> {
    private nodesMap: Map<string, Node<T>> = new Map();
    private nodes: Node<T>[] = [];
    private cnt: number = 0;

    public addNode(name: string): Node<T> {
        let node = this.nodesMap.get(name);
        if (!node) {
            node = new Node<T>(name, this.cnt);
            this.nodesMap.set(name, node);
            this.nodes.push(node);
            this.cnt++;
        }
        return node;
    }

    public getNode(identifier: string | number): Node<T> | undefined {
        if (typeof identifier === "string") {
            return this.nodesMap.get(identifier);
        } else {
            this.validateIndex(identifier);
            return this.nodes[identifier];
        }
    }

    private validateIndex(i: number): void {
        if (i < 0 || i >= this.cnt) {
            throw new Error(`index ${i} is not between 0 and ${this.cnt - 1}`);
        }
    }

    public size(): number {
        return this.cnt;
    }

    public toString(): string {
        let sb = "";
        for (let i = 0; i < this.cnt; i++) {
            const node = this.getNode(i);
            if (node) {
                sb += `${i}: ${node.name}(${node.index})\n`;
            }
        }
        return sb;
    }
}