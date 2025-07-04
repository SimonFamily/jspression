import { Chunk } from "../../src/execution/chunk/chunk";
import { LoxRunner } from "../../src/loxRunner";
import { CustomEnvironment } from "./customEnvironment";

describe('CustomEnvTest', () => {
  it('testIntepreter', () => {
    const lines: string[] = [
      '标题1 * 2 + 1',
      '标题2 * 标题3 + 标题4',
      '标题3 ** 2',
      '标题4 > 0',
      '标题5 = 标题6 * 标题7',
      '标题6 = 标题9 + 标题10',
      '标题7',
      '标题8 = 标题5 + 标题6 + 标题7 + 标题9 + 标题10',
      '标题9',
      '标题10'
    ];
    const env = new CustomEnvironment('formId1');
    const runner = new LoxRunner();
    const r = runner.executeBatch(lines, env) as any[];
    checkResult(r);
  });

  it('testChunk', () => {
    const lines: string[] = [
      '标题1 * 2 + 1',
      '标题2 * 标题3 + 标题4',
      '标题3 ** 2',
      '标题4 > 0',
      '标题5 = 标题6 * 标题7',
      '标题6 = 标题9 + 标题10',
      '标题7',
      '标题8 = 标题5 + 标题6 + 标题7 + 标题9 + 标题10',
      '标题9',
      '标题10'
    ];
    let runner = new LoxRunner();
    const chunk: Chunk = runner.compileSource(lines);
    const env = new CustomEnvironment('formId1');
    runner = new LoxRunner();
    const r = runner.runChunk(chunk, env) as any[];
    checkResult(r);
  });
});

function checkResult(r: any[]) {
  expect(r[0]).toBe(5);
  expect(r[1]).toBe(17);
  expect(r[2]).toBe(16.0);
  expect(r[3]).toBe(true);
  expect(r[4]).toBe(33);
  expect(r[5]).toBe(11);
  expect(r[6]).toBe(3);
  expect(r[7]).toBe(58);
  expect(r[8]).toBe(5);
  expect(r[9]).toBe(6);
}