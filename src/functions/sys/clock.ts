import { Const } from '../const';
import { Function } from '../function';
import { Value } from '../../values/value';

export class Clock extends Function {
  constructor() {
    super('clock', '当前毫秒数', Const.SYSTEM_GROUP);
  }

  arity(): number {
    return 0;
  }

  call(arguments_: Value[]): Value {
    const t = Date.now();
    return new Value(String(t));
  }
}