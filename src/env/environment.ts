import { Field } from "../field";
import { Instance } from "../instance";
import { Value } from "../values/value";

export abstract class Environment {
  public abstract beforeExecute(vars: Field[]): boolean;
  public abstract get(id: string): Value | undefined;
  public abstract getOrDefault(id: string, defValue: Value): Value;
  public abstract size(): number;

  public abstract putValue(id: string, value: Value): void;
  public put(id: string, value: number): void;
  public put(id: string, value: string): void;
  public put(id: string, value: boolean): void;
  public put(id: string, value: Instance): void;
  public put(id: string, v: number | string | boolean | Instance): void {
    if (typeof v === "number") {
      this.putValue(id, new Value(v));
    } else if (typeof v === "string") {
      this.putValue(id, new Value(v));
    } else if (typeof v === "boolean") {
      this.putValue(id, new Value(v));
    } else {
      this.putValue(id, new Value(v));
    }
  }
}
