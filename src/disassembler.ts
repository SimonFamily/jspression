import { OpCode } from './execution/opCode';
import { Chunk } from './execution/chunk/chunk';
import { ChunkReader } from './execution/chunk/chunkReader';
import { Value } from './values/value';
import { Tracer } from './tracer';

export class Disassembler {
  private printer: (msg: string) => void;
  private chunkReader!: ChunkReader;

  constructor(printer?: (msg: string) => void) {
    this.printer = printer || ((msg: string) => console.log(msg));
  }

  public execute(chunk: Chunk): void {
    this.chunkReader = new ChunkReader(chunk, new Tracer());
    let expOrder = 0;
    let op: OpCode;
    this.println('POSITION', 'CODE', 'PARAMETER', 'ORDER');
    while (true) {
      const pos = String(this.chunkReader.position());
      op = this.readCode();
      let param = '';
      switch (op) {
        case OpCode.OP_BEGIN:
          expOrder = this.chunkReader.readInt();
          param = String(expOrder);
          break;
        case OpCode.OP_CONSTANT: {
          const v = this.readConstant();
          param = v.toString();
          break;
        }
        case OpCode.OP_GET_GLOBAL:
        case OpCode.OP_SET_GLOBAL:
        case OpCode.OP_GET_PROPERTY:
        case OpCode.OP_SET_PROPERTY:
        case OpCode.OP_CALL:
          param = this.readString();
          break;
        case OpCode.OP_JUMP_IF_FALSE: {
          const offset = this.chunkReader.readInt();
          param = this.gotoOffset(offset);
          break;
        }
        case OpCode.OP_JUMP: {
          const offset = this.chunkReader.readInt();
          param = this.gotoOffset(offset);
          break;
        }
        case OpCode.OP_EXIT:
          this.println(pos, op.getTitle(), '', String(expOrder));
          return;
        default:
          break;
      }
      this.println(pos, op.getTitle(), param, String(expOrder));
    }
  }

  private readString(): string {
    const value = this.readConstant();
    return value.asString();
  }

  private readConstant(): Value {
    const index = this.chunkReader.readInt();
    return this.chunkReader.readConst(index);
  }

  private readCode(): OpCode {
    const code = this.chunkReader.readByte();
    return OpCode.forValue(code);
  }

  private gotoOffset(offset: number): string {
    const curPos = this.chunkReader.position();
    return `:${offset}->to:${curPos + offset}`;
  }

  private println(pos: string, op: string, param: string, order: string): void {
    const line =
      `${pos.slice(0, 10).padEnd(10, ' ')}` +
      `${op.slice(0, 18).padEnd(20, ' ')}` +
      `${param.slice(0, 18).padEnd(20, ' ')}` +
      `${order}\n`;
    this.printer(line);
  }
}