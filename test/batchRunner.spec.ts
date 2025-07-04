import { LoxRunner } from '../src/loxRunner';
import { DefaultEnvironment } from '../src/env/defaultEnvironment';
import { Environment } from '../src/env/environment';
import { ExecuteMode } from '../src/executeMode';
import { Chunk } from '../src/execution/chunk/chunk';

const FORMULA_BATCHES = 1000;
const Directory = 'BatchRunnerTest';

describe('BatchRunnerTest', () => {
  it('should execute expressions by interpreting syntax tree', () => {
    console.log('批量运算测试(解析执行)');
    const lines = getExpressions();
    const runner = new LoxRunner();
    runner.setExecuteMode(ExecuteMode.SyntaxTree);
    runner.setTrace(true);
    const env = getEnv();
    runner.executeBatch(lines, env);
    checkValues(env);
    console.log('==========');
  });

  it('should execute expressions by compiling source to chunk', () => {
    console.log('批量运算测试(编译+字节码执行)');
    const start = Date.now();
    const lines = getExpressions();
    const runner = new LoxRunner();
    runner.setTrace(true);
    const chunk: Chunk = runner.compileSource(lines);
    const env = getEnv();
    runner.runChunk(chunk, env);
    checkValues(env);
    console.log('总耗时(ms)：' + (Date.now() - start));
    console.log('==========');

    // 模拟序列化
    const fileName = 'Chunks.ser';
    const path = getPath(Directory, fileName);
    serializeObject(chunk, path);
  });

  it('should execute expression chunk directly', () => {
    console.log('批量运算测试(字节码直接执行)');
    const start = Date.now();
    const chunk: Chunk = deserializeObject(getPath(Directory, 'Chunks.ser'));
    console.log('完成从文件反序列化字节码。' + ' 耗时(ms):' + (Date.now() - start));

    const runner = new LoxRunner();
    runner.setTrace(true);
    const env = getEnv();
    runner.runChunk(chunk, env);
    checkValues(env);
    console.log('==========');
  });
});

function getExpressions(): string[] {
  const lines: string[] = [];
  const fml =
    'A! = 1 + 2 * 3 - 6 - 1 + B! + C! * (D! - E! + 10 ** 2 / 5 - (12 + 8)) - F! * G! +  100 / 5 ** 2 ** 1';
  const fml1 = 'B! = C! + D! * 2 - 1';
  const fml2 = 'C! = D! * 2 + 1';
  const fml3 = 'D! = E! + F! * G!';
  const fml4 = 'G! = M! + N!';

  for (let i = 0; i < FORMULA_BATCHES; i++) {
    lines.push(fml.replace(/!/g, String(i)));
    lines.push(fml1.replace(/!/g, String(i)));
    lines.push(fml2.replace(/!/g, String(i)));
    lines.push(fml3.replace(/!/g, String(i)));
    lines.push(fml4.replace(/!/g, String(i)));
  }
  return lines;
}

function getEnv(): Environment {
  const env = new DefaultEnvironment();
  for (let i = 0; i < FORMULA_BATCHES; i++) {
    env.put('E' + i, 2);
    env.put('F' + i, 3);
    env.put('M' + i, 4);
    env.put('N' + i, 5);
  }
  return env;
}

function checkValues(env: Environment) {
  // 随机检查10个索引
  for (let i = 0; i < 10; i++) {
    const index = Math.floor(Math.random() * FORMULA_BATCHES);
    expect(env.get('A' + index)?.getValue()).toBe(1686.0);
    expect(env.get('B' + index)?.getValue()).toBe(116);
    expect(env.get('C' + index)?.getValue()).toBe(59);
    expect(env.get('D' + index)?.getValue()).toBe(29);
    expect(env.get('G' + index)?.getValue()).toBe(9);
  }
}

// 以下为模拟的序列化/反序列化和路径方法
function getPath(dir: string, fileName: string): string {
  // 实际项目中请用path.join
  return `${dir}/${fileName}`;
}

function serializeObject(obj: any, path: string): void {
  // 这里仅做模拟，实际应写入文件
  (globalThis as any).__chunk_cache__ = (globalThis as any).__chunk_cache__ || {};
  (globalThis as any).__chunk_cache__[path] = obj;
}

function deserializeObject(path: string): any {
  // 这里仅做模拟，实际应从文件读取
  return (globalThis as any).__chunk_cache__?.[path];
}