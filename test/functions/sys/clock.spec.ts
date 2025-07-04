import { JpRunner } from '../../../src/jpRunner'

describe('ClockTest', () => {
  it('should invoke clock function', () => {
    const runner = new JpRunner();
    console.log('Clock测试：');
    console.log(runner.execute('clock()'));
    console.log(runner.execute('1 + 2 * 3 - 5 + " abc " + clock() + " " + 123'));
    console.log('==========');
  });
});