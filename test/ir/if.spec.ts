import { LoxRunner } from '../../src/loxRunner';
import { DefaultEnvironment } from '../../src/env/defaultEnvironment';
import { LoxParseError } from '../../src/parser/parseError';

describe('IfTest', () => {
    it('should handle basic if expression', () => {
        const env = new DefaultEnvironment();
        env.put('a', 1);
        env.put('b', 2);
        env.put('c', 3);
        const runner = new LoxRunner();
        expect(runner.execute('if(a + b * c >= 6, 6 ** 2, -6 * 2)', env)).toBe(36.0);
        expect(runner.execute('if(a + b * c < 6, 6 ** 2, -6 * 2)', env)).toBe(-12);
        expect(runner.execute('if(a + b * c < 6, 6 ** 2)', env)).toBeNull();
        expect(runner.execute('if(a + b * c >= 6, 6 ** 2)', env)).toBe(36.0);
    });

    it('should handle nested expression', () => {
        const env = new DefaultEnvironment();
        const runner = new LoxRunner();
        const str1 = 'if(score >= 85, "A", if(score >= 70, "B", if(score >= 60, "C", "D")))';
        const str2 = 'if(score >= 70, if(score < 85, "B","A"), if(score >= 60, "C", "D"))';
        env.put('score', 90);
        expect(runner.execute(str1, env)).toBe('A');
        expect(runner.execute(str2, env)).toBe('A');
        env.put('score', 65);
        expect(runner.execute(str1, env)).toBe('C');
        expect(runner.execute(str2, env)).toBe('C');
        env.put('score', 50);
        expect(runner.execute(str1, env)).toBe('D');
        expect(runner.execute(str2, env)).toBe('D');
    });

    it('should handle only one branch', () => {
        const env = new DefaultEnvironment();
        env.put('x1', 0);
        env.put('y1', 0);
        env.put('x2', 0);
        env.put('y2', 0);
        const runner = new LoxRunner();
        expect(runner.execute('if(1 == 1, x1 = 1, y1 = 2)', env)).toBe(1);
        expect(env.get('x1')?.getValue()).toBe(1);
        expect(env.get('y1')?.getValue()).toBe(0);
        expect(runner.execute('if(1 != 1, x2 = 1, y2 = 2)', env)).toBe(2);
        expect(env.get('x2')?.getValue()).toBe(0);
        expect(env.get('y2')?.getValue()).toBe(2);
    });

    test('should throw error', () => {
        const env = new DefaultEnvironment();
        env.put('a', 1);
        env.put('b', 2);
        env.put('c', 3);
        const runner = new LoxRunner();
        expect(() => runner.execute('if()', env)).toThrow(LoxParseError);
        expect(() => runner.execute('if(a + b * c >= 6)', env)).toThrow(LoxParseError);
        expect(() => runner.execute('if(a + b * c >= 6,)', env)).toThrow(LoxParseError);
    });
});