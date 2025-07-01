import { Field } from "../field";
import { Instance } from "../instance";
import { Value } from "../values/value";

export abstract class Environment {
    public abstract beforeExecute(vars: Field[]): boolean;
    public abstract get(id: string): Value;
    public abstract getOrDefault(id: string, defValue: Value): Value;
    public abstract size(): number;
    
    public abstract putValue(id: string, value: Value): void;
    public put(id: string, value: number): void;
    public put(id: string, value: string): void;
    public put(id: string, value: boolean): void;
    public put(id: string, obj: Instance): void;
    public put(id: string, value: number | string | boolean | Instance): void {
        this.putValue(id, new Value(value));
    }
}