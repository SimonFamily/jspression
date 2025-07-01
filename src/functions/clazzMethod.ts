import { Callable } from "./callable";
import { Value } from "../values/value";

export class ClazzMethod implements Callable {
    arity(): number {
        // TODO: 实现具体的方法参数数量
        return 0;
    }

    call(args: Value[]): Value {
        // TODO: 实现具体的方法调用逻辑
        return new Value();
    }
}