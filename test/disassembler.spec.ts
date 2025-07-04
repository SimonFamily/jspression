import { Chunk } from "../src/execution/chunk/chunk";
import { LoxRunner } from "../src/loxRunner";
import { Disassembler } from "../src/disassembler";
import { AssemblyContents } from "./resource/assemblyContent";

describe('Disassembler', () => {
  it('should disassemble byte codes', () => {
    const lines: string[] = [
      "a + b * c - 100 / 5 ** 2 ** 1",
      "a + b * c >= 6",
      "1 + 2 - 3",
      "3 * (2 + 1)",
      "a + (b - c)",
      "a * 2 + (b - c)",
      "x = y = a + b * c",
      "a > 1 || b > 1 || c > 1 || d > 1",
      "aa > 11 && bb > 11 && cc > 11 && dd > 11",
    ]

    const runner = new LoxRunner();
    const chunk: Chunk = runner.compileSource(lines);
    let res: string[] = [];
    const disassembler = new Disassembler(msg => res.push(msg));
    disassembler.execute(chunk);

    expect(chunk.getByteSize()).toBe(445); // 编译后字节码的大小445字节
    expect(res.length).toBe(AssemblyContents.length);
    for (let i = 0; i < res.length; i++) {
      expect(res[i]).toBe(AssemblyContents[i]);
    }
    
    // const str = JSON.stringify(res);
    // console.log(str);
  });
});