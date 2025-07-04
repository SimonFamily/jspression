import { LoxRunner } from '../src/loxRunner';
import { DefaultEnvironment } from '../src/env/defaultEnvironment';
import { Environment } from '../src/env/environment';

describe('LoxRunnerTest', () => {
  it('should handle basic numerical expressions', () => {
    const runner = new LoxRunner();
    expect(runner.execute('1 + 2 - 3')).toBe(0);
    expect(runner.execute('1 + 2 * 3')).toBe(7);
    expect(runner.execute('3 * (2 + 1)')).toBe(9);
    expect(runner.execute('1 + 2 * 3 ** 2 ** 1')).toBe(19.0);
    expect(runner.execute('3 * (2 + 1.0)')).toBe(9.0);
    expect(runner.execute('3 * (2 + 1.0) > 7')).toBe(true);
  });

  it('should handle assignment expression with variables', () => {
    const env: Environment = new DefaultEnvironment();
    const runner = new LoxRunner();
    env.put('a', 1);
    env.put('b', 2);
    env.put('c', 3);
    expect(runner.execute('x = y = a + b * c', env)).toBe(7);
    expect(env.get('x')?.getValue()).toBe(7);
    expect(env.get('y')?.getValue()).toBe(7);
  });

  it('should handle evaluated expression with variables', () => {
    const env: Environment = new DefaultEnvironment();
    env.put('a', 1);
    env.put('b', 2);
    env.put('c', 3);
    const runner = new LoxRunner();
    let r = runner.execute('a + b * c - 100 / 5 ** 2 ** 1', env);
    expect(r).toBe(3.0);

    r = runner.execute('a + b * c >= 6', env);
    expect(r).toBe(true);
  });

  it('should handle multiple evaluation expressions', () => {
    const env: Environment = new DefaultEnvironment();
    env.put('a', 1);
    env.put('b', 2);
    env.put('c', 3);
    const lines: string[] = [
      'a + b * c - 100 / 5 ** 2 ** 1',
      'a + b * c >= 6',
      '1 + 2 - 3',
      '3 * (2 + 1)',
      'a + (b - c)',
      'a * 2 + (b - c)',
      'x = y = a + b * c'
    ];

    const runner = new LoxRunner();
    const r = runner.executeBatch(lines, env) as any[];
    expect(r[0]).toBe(3.0);
    expect(r[1]).toBe(true);
    expect(r[2]).toBe(0);
    expect(r[3]).toBe(9);
    expect(r[4]).toBe(0);
    expect(r[5]).toBe(1);
    expect(r[6]).toBe(7);
    expect(env.get('x')?.getValue()).toBe(7);
    expect(env.get('y')?.getValue()).toBe(7);
  });

  it('should handle multiple assignment expressions', () => {
    const srcs: string[] = [
      'x = a + b * c',
      'a = m + n',
      'b = a * 2',
      'c = n + w'
    ];

    const runner = new LoxRunner();
    const env: Environment = new DefaultEnvironment();
    env.put('m', 2);
    env.put('n', 4);
    env.put('w', 6);
    const results = runner.executeBatch(srcs, env) as any[];
    expect(env.get('x')?.getValue()).toBe(126);
    expect(env.get('a')?.getValue()).toBe(6);
    expect(env.get('b')?.getValue()).toBe(12);
    expect(env.get('c')?.getValue()).toBe(10);

    expect(results[0]).toBe(126);
    expect(results[1]).toBe(6);
    expect(results[2]).toBe(12);
    expect(results[3]).toBe(10);
  });
});