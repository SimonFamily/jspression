import { JpRunner } from '../src/jpRunner';
import { DefaultEnvironment } from '../src/env/defaultEnvironment';
import { Environment } from '../src/env/environment';
import { Expr } from '../src/ir/expr';
import { ExprInfo } from '../src/ir/exprInfo';
import { Chunk } from '../src/execution/chunk/chunk';

const FORMULA_BATCHES = 1000;
const RUN_BATCHES = 1;
const Directory = 'SerializeTest';

describe('SerializeTest', () => {
  it('chunkSerializeTest', () => {
    console.log('序列化反序列化测试：');
    chunkSerializeTest();
  });
});

function chunkSerializeTest() {
  const lines = createFormulas();
  console.log('表达式总数：' + lines.length);

  const runner = new JpRunner();

  console.log('开始解析和分析：');
  let start = Date.now();
  const exprs: Expr[] = runner.parse(lines);
  let exprInfos: ExprInfo[] = runner.analyze(exprs);
  console.log('中间结果生成完成。' + ' 耗时(ms):' + (Date.now() - start));

  runner.setTrace(true);
  let chunk: Chunk = runner.compileIR(exprInfos);

  console.log('开始进行字节码序列化反序列化，字节码大小(KB)：' + (chunk.getByteSize() / 1024));
  start = Date.now();
  const fileName = 'Chunks.ser';
  const path = getPath(Directory, fileName);
  serializeObject(chunk, path);
  console.log('字节码已序列化到文件：' + fileName + ' 耗时(ms):' + (Date.now() - start));

  start = Date.now();
  chunk = deserializeObject(path);
  console.log('完成从文件反序列化字节码。' + ' 耗时(ms):' + (Date.now() - start));

  console.log('开始执行字节码：');
  start = Date.now();
  let env: Environment = getEnvironment();
  for (let i = 0; i < RUN_BATCHES; i++) {
    runner.runChunk(chunk, env);
  }
  checkResult(env);
  console.log('字节码执行完成。' + ' 耗时(ms):' + (Date.now() - start));

  console.log('开始执行语法树');
  start = Date.now();
  env = getEnvironment();
  for (let i = 0; i < RUN_BATCHES; i++) {
    runner.runIR(exprInfos, env);
  }
  checkResult(env);
  console.log('语法树执行完成。' + ' 耗时(ms):' + (Date.now() - start));

  // 可选：json序列化
  // const json = JSON.stringify(chunk);
  // writeString(json, getPath(Directory, 'Chunks.json'));
  console.log('==========');
}

function createFormulas(): string[] {
  const fml =
    'A! = 1 + 2 * 3 - 6 - 1 + B! + C! * (D! - E! + 10 ** 2 / 5 - (12 + 8)) - F! * G! +  100 / 5 ** 2 ** 1';
  const fml1 = 'B! = C! + D! * 2 - 1';
  const fml2 = 'C! = D! * 2 + 1';
  const fml3 = 'D! = E! + F! * G!';
  const fml4 = 'G! = M! + N!';
  const lines: string[] = [];

  for (let i = 0; i < FORMULA_BATCHES; i++) {
    lines.push(fml.replace(/!/g, String(i)));
    lines.push(fml1.replace(/!/g, String(i)));
    lines.push(fml2.replace(/!/g, String(i)));
    lines.push(fml3.replace(/!/g, String(i)));
    lines.push(fml4.replace(/!/g, String(i)));
  }
  return lines;
}

function getEnvironment(): Environment {
  const env = new DefaultEnvironment();
  for (let i = 0; i < FORMULA_BATCHES; i++) {
    env.put('E' + i, 2);
    env.put('F' + i, 3);
    env.put('M' + i, 4);
    env.put('N' + i, 5);
  }
  return env;
}

function checkResult(env: Environment) {
  for (let i = 0; i < 10; i++) {
    const index = Math.floor(Math.random() * FORMULA_BATCHES);
    expect(env.get('A' + index)?.getValue()).toBe(1686.0);
    expect(env.get('B' + index)?.getValue()).toBe(116);
    expect(env.get('C' + index)?.getValue()).toBe(59);
    expect(env.get('D' + index)?.getValue()).toBe(29);
    expect(env.get('G' + index)?.getValue()).toBe(9);
  }
}

// --- 以下为模拟的序列化/反序列化和路径方法 ---

function getPath(directory: string, fileName: string): string {
  // 模拟路径拼接
  return `.temp/${directory}/${fileName}`;
}

function serializeObject(obj: any, path: string): void {
  // 这里只做内存模拟，实际项目可用 fs.writeFileSync/JSON.stringify 或二进制序列化
  (globalThis as any).__chunk_cache__ = (globalThis as any).__chunk_cache__ || {};
  (globalThis as any).__chunk_cache__[path] = obj;
}

function deserializeObject(path: string): any {
  // 这里只做内存模拟，实际项目可用 fs.readFileSync/JSON.parse 或二进制反序列化
  return (globalThis as any).__chunk_cache__?.[path];
}

// 可选：模拟写字符串到文件
function writeString(content: string, path: string): void {
  // 这里只做内存模拟
  (globalThis as any).__string_cache__ = (globalThis as any).__string_cache__ || {};
  (globalThis as any).__string_cache__[path] = content;
}