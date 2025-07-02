import { Parser } from '../../src/parser/parser';
import { Tracer } from '../../src/tracer';
import { OpCodeCompiler } from '../../src/visitors/opCodeCompiler';
import { VM } from '../../src/execution/vm';
import { DefaultEnvironment } from '../../src/env/defaultEnvironment';
import { Environment } from '../../src/env/environment';

function execute(src: string, env?: Environment): any {
    if (!env) {
        env = new DefaultEnvironment();
    }
    const p = new Parser(src);
    const expr = p.parse();

    const tracer = new Tracer();
    const compiler = new OpCodeCompiler(tracer);
    compiler.beginCompile();
    compiler.compileExpr(expr, 0);
    const chunk = compiler.endCompile();

    const vm = new VM(tracer);
    const exResults = vm.execute(chunk, env);
    const r = exResults[0].getResult();
    return r && r.getValue();
}

describe('VMTest', () => {
    it('should perform numerical calculations ', () => {
        expect(execute('1 + 2 * 3')).toBe(7);
        expect(execute('1 + 2 - 3')).toBe(0);
        expect(execute('3 * (2 + 1)')).toBe(9);
        expect(execute('1 + 2 * 3 ** 2 ** 1')).toBe(19.0);
        expect(execute('3 * (2 + 1.0)')).toBe(9.0);
        expect(execute('3 * (2 + 1.0) > 7')).toBe(true);
    });

    it('should handle variable calculations ', () => {
        const env: Environment = new DefaultEnvironment();
        env.put('a', 1);
        env.put('b', 2);
        env.put('c', 3);
        expect(execute('a + b * c - 100 / 5 ** 2 ** 1', env)).toBe(3.0);
        expect(execute('a + b * c >= 6', env)).toBe(true);
        expect(execute('x = y = a + b * c', env)).toBe(7);
        expect(env.get('x')?.getValue()).toBe(7);
        expect(env.get('y')?.getValue()).toBe(7);
    });

    it('should handle string concatenation', () => {
        expect(execute('"hello" + " world"')).toBe('hello world');
        expect(execute('"a" + 1')).toBe('a1');
        expect(execute('"a" + 1 + "b"')).toBe('a1b');
        expect(execute('"a" + 1 * 2')).toBe('a2');
    });

    it('should handle comparisons', () => {
        expect(execute('1 < 2')).toBe(true);
        expect(execute('2 > 1')).toBe(true);
        expect(execute('1 <= 1')).toBe(true);
        expect(execute('2 >= 2')).toBe(true);
        expect(execute('1 == 1')).toBe(true);
        expect(execute('1 != 2')).toBe(true);
        expect(execute('"a" == "a"')).toBe(true);
        expect(execute('"a" != "b"')).toBe(true);
        expect(execute('1 < 2 && 3 > 2')).toBe(true);
    });

    it('should handle unary operations', () => {
        expect(execute('-1')).toBe(-1);
        expect(execute('-2.5')).toBe(-2.5);
        expect(execute('!(1 == 1)')).toBe(false);
        expect(execute('!(1 == 2)')).toBe(true);
        expect(execute('!""')).toBe(true);
        expect(execute('!1')).toBe(false);
    });

    it('should handle variable assignments', () => {
        const env: Environment = new DefaultEnvironment();
        expect(execute('x = 10', env)).toBe(10);
        expect(env.get('x')?.getValue()).toBe(10);
        expect(execute('y = x + 5', env)).toBe(15);
        expect(env.get('y')?.getValue()).toBe(15);
        expect(execute('z = y * 2', env)).toBe(30);
        expect(env.get('z')?.getValue()).toBe(30);
    });

    it('should handle nested expressions', () => {
        const env: Environment = new DefaultEnvironment();
        env.put('a', 1);
        env.put('b', 2);
        expect(execute('a + (b * 3)', env)).toBe(7);
        expect(execute('(a + b) * 2', env)).toBe(6);
        expect(execute('((a + b) * 2) - 1', env)).toBe(5);
    });

    it('should handle complex expressions', () => {
        const env: Environment = new DefaultEnvironment();
        env.put('x', 10);
        env.put('y', 20);
        expect(execute('x + y * 2 - 5', env)).toBe(45);
        expect(execute('(x + y) / 2', env)).toBe(15);
        expect(execute('x * (y - 5)', env)).toBe(150);
    });

    it('should handle logical expressions', () => {
        const env: Environment = new DefaultEnvironment();
        env.put('a', true);
        env.put('b', false);
        expect(execute('a && b', env)).toBe(false);
        expect(execute('a || b', env)).toBe(true);
        expect(execute('!a', env)).toBe(false);
        expect(execute('!b', env)).toBe(true);
        expect(execute('a && (1 + 2 > 2)', env)).toBe(true);
    });

    it('should handle mixed types', () => {
        const env: Environment = new DefaultEnvironment();
        env.put('a', 1);
        env.put('b', '2');
        expect(execute('a + b', env)).toBe('12'); // 数字和字符串相加
        expect(execute('"a" + b', env)).toBe('a2'); // 字符串和数字相加
    });
});