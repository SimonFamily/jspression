import { StringUtils } from "./util/stringUtils";

export class Field {
    private src: string | null = null;

    constructor(
        private readonly name: string,
        private readonly owner: Field | null = null
    ) {}

    public getName(): string {
        return this.name;
    }

    public getOwner(): Field | null {
        return this.owner;
    }

    public static valueOf(src: string): Field {
        const names = src.split(".");
        let current: Field | null = null;
        
        for (const name of names) {
            current = new Field(name, current);
        }
        
        return current!; // 非空断言，因为循环至少会创建一次
    }

    private search(field: Field | null, path: string[]): void {
        if (field === null) return;
        
        this.search(field.owner, path);
        path.push(field.name);
    }

    public toString(): string {
        if (StringUtils.isEmpty(this.src)) {
            const path: string[] = [];
            this.search(this, path);
            this.src = path.join(".");
        }
        return this.src!;
    }
}