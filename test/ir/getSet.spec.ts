import { Instance } from '../../src/instance';
import { LoxRunner } from '../../src/loxRunner';
import { DefaultEnvironment } from '../../src/env/defaultEnvironment';
import { Value } from '../../src/values/value';

describe('GetSetTest', () => {
    it('should handle instance property', () => {
        const env = new DefaultEnvironment();
        const t1 = new Instance();
        t1.set('a', new Value(1));
        const t2 = new Instance();
        t2.set('b', new Value(2));
        t2.set('c', new Value(3));
        env.put('t1', t1);
        env.put('t2', t2);

        const runner = new LoxRunner();
        const lines: string[] = [];
        lines.push('t1.x = t1.a + t2.b * t2.c + m');
        lines.push('m = t1.a + t2.b * t2.c');
        const r = runner.executeBatch(lines, env);

        expect(env.get('m')?.getValue()).toBe(7);
        expect(env.get('t1')?.asInstance().get('x').asInteger()).toBe(14);
        expect(r[0]).toBe(14);
        expect(r[1]).toBe(7);
    });
});