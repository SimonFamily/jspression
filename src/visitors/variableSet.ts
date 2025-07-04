export class VariableSet {
    private assigns: Set<string> = new Set();
    private depends: Set<string> = new Set();
    
    public getAssigns(): Set<string> {
        return new Set(this.assigns); // 返回副本防止外部修改
    }
    
    public setAssigns(assigns: Set<string>): void {
        this.assigns = new Set(assigns);
    }
    
    public getDepends(): Set<string> {
        return new Set(this.depends); // 返回副本防止外部修改
    }
    
    public setDepends(depends: Set<string>): void {
        this.depends = new Set(depends);
    }
    
    public addAssign(name: string): void {
        this.assigns.add(name);
    }
    
    public addDepend(name: string): void {
        this.depends.add(name);
    }
    
    public combine(other: VariableSet): void {
        if (!other) return;
        
        for (const name of other.getAssigns()) {
            this.assigns.add(name);
        }
        
        for (const name of other.getDepends()) {
            this.depends.add(name);
        }
    }
    
    public static fromDepends(...names: string[]): VariableSet {
        const result = new VariableSet();
        for (const name of names) {
            result.addDepend(name);
        }
        return result;
    }
    
    public static fromAssigns(...names: string[]): VariableSet {
        const result = new VariableSet();
        for (const name of names) {
            result.addAssign(name);
        }
        return result;
    }
    
    public toString(): string {
        const assignList = Array.from(this.assigns).sort().join(",");
        const dependList = Array.from(this.depends).sort().join(",");
        
        let result = "";
        if (assignList) {
            result += assignList + " = ";
        }
        result += dependList;
        
        return result;
    }
}