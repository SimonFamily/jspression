import { Value } from "../values/value";

export interface Callable {
    /**
     * 获取函数期望的参数数量
     */
    arity(): number;
    
    /**
     * 调用函数
     * @param arguments 参数值列表
     */
    call(args: Value[]): Value;
}