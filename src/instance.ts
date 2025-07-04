import { Clazz } from "./clazz";
import { Value } from "./values/value";
import { JpRuntimeError } from "./jpRuntimeError";

export class Instance {
    private clazz: Clazz | null = null;
    private fields: Map<string, Value> = new Map();

    constructor();
    constructor(clazz: Clazz);
    constructor(clazz?: Clazz) {
        if (clazz) {
            this.clazz = clazz;
        }
    }

    public get(name: string): Value {
        if (this.fields.has(name)) {
            return this.fields.get(name)!; // 非空断言，因为已检查存在
        }
        throw new JpRuntimeError(`Undefined property '${name}'.`);
    }

    public set(name: string, value: Value): void {
        this.fields.set(name, value);
    }

    public has(name: string): boolean {
        return this.fields.has(name);
    }

    public getFields(): Map<string, Value> {
        return new Map(this.fields); // 返回副本防止外部修改
    }

    public getClazz(): Clazz | null {
        return this.clazz;
    }

    public setClazz(clazz: Clazz): void {
        this.clazz = clazz;
    }

    public toString(): string {
        return this.clazz ? `${this.clazz.name} instance` : "anonymous instance";
    }
}