import { JpRunner } from '../../../src/jpRunner';

describe('AbsTest', () => {
  it('should invoke abs function', () => {
    const runner = new JpRunner();
    expect(runner.execute('abs(-1)')).toBe(1);
    expect(runner.execute('abs(1)')).toBe(1);
    expect(runner.execute('1 + 2 * 3 + abs(1 - 2 * 3)')).toBe(1 + 2 * 3 + Math.abs(1 - 2 * 3));
    expect(runner.execute('1 + 2 * 3 + abs(1 + 2 * 3)')).toBe(1 + 2 * 3 + Math.abs(1 + 2 * 3));
  });
});