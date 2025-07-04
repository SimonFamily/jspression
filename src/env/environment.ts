import { Field } from "../field";
import { Instance } from "../instance";
import { Value } from "../values/value";

export abstract class Environment {
  /**
   * 在执行表达式前，表达式中用到的所有变量都会传递进此方法中，业务上可以提前批量准备好数据，
   * 例如从数据库中查询数据等，避免每个变量都单独查询时的性能问题。
   * 如果返回false，则不会执行表达式。
   * @param vars 表达式中用到的变量列表
   * @returns true表示可以执行表达式，false表示不执行表达式
   */
  public abstract beforeExecute(vars: Field[]): boolean;
  public abstract get(id: string): Value | undefined;
  public abstract getOrDefault(id: string, defValue: Value): Value;
  public abstract size(): number;
  public abstract putValue(id: string, value: Value): void;

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
