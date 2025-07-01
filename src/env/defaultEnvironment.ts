import { Field } from "../field";
import { Value } from "../values/value";
import { Environment } from "./environment";

export class DefaultEnvironment extends Environment {
    private map: Map<string, Value> = new Map();

    beforeExecute(vars: Field[]): boolean {
        return true;
    }

    get(id: string): Value | undefined {
        return this.map.get(id);
    }

    getOrDefault(id: string, defValue: Value): Value {
        return this.map.get(id) || defValue;
    }

    putValue(id: string, value: Value): void {
        this.map.set(id, value);
    }

    size(): number {
        return this.map.size;
    }
}