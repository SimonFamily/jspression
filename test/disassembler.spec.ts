import { Chunk } from "../src/execution/chunk/chunk";
import { LoxRunner } from "../src/loxRunner";
import { Disassembler } from "../src/disassembler";

describe('Disassembler', () => {
  it('should disassemble compiled source', () => {
    const lines: string[] = [
      'a == 1 || b == 0 || c == 0'
    ];

    const runner = new LoxRunner();
    const chunk: Chunk = runner.compileSource(lines);
    let res: string[] = [];
    const disassembler = new Disassembler(msg => res.push(msg));
    disassembler.execute(chunk);
    //console.log(res.join(''));
  });
});