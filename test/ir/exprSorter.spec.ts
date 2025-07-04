import { Expr } from '../../src/ir/expr';
import { ExprInfo } from '../../src/ir/exprInfo';
import { LoxContext } from '../../src/loxContext';
import { LoxRunner } from '../../src/loxRunner';
import { DefaultEnvironment } from '../../src/env/defaultEnvironment';
import { Environment } from '../../src/env/environment';
import { ExprSorter } from '../../src/ir/exprSorter';

describe('ExprSorterTest', () => {
  it('should sort formulas', () => {
    const srcs: string[] = [];
    srcs.push('x = y = a + b * c');
    srcs.push('a = m + n');
    srcs.push('b = a * 2');
    srcs.push('c = n + w + b');

    const context = new LoxContext();
    let runner = new LoxRunner();
    const exprs: Expr[] = runner.parse(srcs);
    let exprInfos: ExprInfo[] | null = runner.analyze(exprs);
    context.prepareExecute(exprInfos);
    const sorter = new ExprSorter(context);
    exprInfos = sorter.sort();
    expect(exprInfos && exprInfos.length === 4).toBeTruthy();
    if (!exprInfos) {
      throw new Error('exprInfos should not be null');
    }
    expect(srcs[exprInfos[0].getIndex()]).toBe('a = m + n');
    expect(srcs[exprInfos[1].getIndex()]).toBe('b = a * 2');
    expect(srcs[exprInfos[2].getIndex()]).toBe('c = n + w + b');
    expect(srcs[exprInfos[3].getIndex()]).toBe('x = y = a + b * c');

    runner = new LoxRunner();
    const env: Environment = new DefaultEnvironment();
    env.put('m', 2);
    env.put('n', 4);
    env.put('w', 6);
    runner.executeBatch(srcs, env);
    expect(env.get('x')?.getValue()).toBe(270);
    expect(env.get('y')?.getValue()).toBe(270);
    expect(env.get('a')?.getValue()).toBe(6);
    expect(env.get('b')?.getValue()).toBe(12);
    expect(env.get('c')?.getValue()).toBe(22);
  });

  it('should sort mixed formulas', () => {
    const srcs: string[] = [];
    srcs.push('b * 2 + 1');
    srcs.push('a * b + c');
    srcs.push('x = y = a + b * c');
    srcs.push('a = m + n');
    srcs.push('b = a * 2');
    srcs.push('c = n + w + b');

    let runner = new LoxRunner();
    const exprs: Expr[] = runner.parse(srcs);
    const exprInfos: ExprInfo[] = runner.analyze(exprs);
    expect(exprInfos && exprInfos.length === 6).toBeTruthy();
    expect(srcs[exprInfos[0].getIndex()]).toBe('a = m + n');
    expect(srcs[exprInfos[1].getIndex()]).toBe('b = a * 2');
    expect(srcs[exprInfos[2].getIndex()]).toBe('c = n + w + b');
    expect(srcs[exprInfos[3].getIndex()]).toBe('x = y = a + b * c');
    expect(srcs[exprInfos[4].getIndex()]).toBe('b * 2 + 1');
    expect(srcs[exprInfos[5].getIndex()]).toBe('a * b + c');

    runner = new LoxRunner();
    const env: Environment = new DefaultEnvironment();
    env.put('m', 2);
    env.put('n', 4);
    env.put('w', 6);
    const result: any[] | null = runner.executeBatch(srcs, env);
    if (!result) {
      throw new Error('result should not be null');
    }
    expect(result.length).toBe(6);
    expect(env.get('x')?.getValue()).toBe(270);
    expect(env.get('y')?.getValue()).toBe(270);
    expect(env.get('a')?.getValue()).toBe(6);
    expect(env.get('b')?.getValue()).toBe(12);
    expect(env.get('c')?.getValue()).toBe(22);

    expect(result[0]).toBe(12 * 2 + 1);
    expect(result[1]).toBe(6 * 12 + 22);
    expect(result[2]).toBe(270);
    expect(result[3]).toBe(6);
    expect(result[4]).toBe(12);
    expect(result[5]).toBe(22);
  });
});