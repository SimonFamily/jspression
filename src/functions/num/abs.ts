import { JpRuntimeError } from '../../jpRuntimeError';
import { Const } from '../const';
import { Function } from '../function';
import { Value } from '../../values/value';

export class Abs extends Function {
  constructor() {
    super('abs', '绝对值', Const.NUMBER_GROUP);
  }

  arity(): number {
    return 1;
  }

  call(args: Value[]): Value {
    if (!args || args.length !== 1 || !args[0].isNumber()) {
      throw new JpRuntimeError('参数不合法！');
    }
    const v = args[0];
    if (v.isDouble()) {
      return new Value(Math.abs(v.asDouble()));
    } else {
      return new Value(Math.abs(v.asInteger()));
    }
  }
}