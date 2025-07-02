import { LoxRunner } from '../../src/loxRunner';
import { DefaultEnvironment } from '../../src/env/defaultEnvironment';

describe('LogicTest', () => {
    test('should handle logic expression', () => {
        const env = new DefaultEnvironment();
        env.put('a', 1);
        env.put('b', 2);
        env.put('c', 3);
        const runner = new LoxRunner();
        expect(runner.execute('a == 1 || b == 0 || c == 0', env)).toBe(true);
        expect(runner.execute('a == 0 || b == 2 || c == 0', env)).toBe(true);
        expect(runner.execute('a == 0 || b == 0 || c == 3', env)).toBe(true);
        expect(runner.execute('a == 0 || b == 0 || c == 0', env)).toBe(false);
        expect(runner.execute('a == 1 && b == 2 && c == 3', env)).toBe(true);
        expect(runner.execute('a == 0 && b == 2 && c == 3', env)).toBe(false);
        expect(runner.execute('a == 1 && b == 0 && c == 3', env)).toBe(false);
        expect(runner.execute('a == 1 && b == 2 && c == 0', env)).toBe(false);
    });
});