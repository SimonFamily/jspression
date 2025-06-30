const config = {
  preset: 'ts-jest',
  testEnvironment: 'node', // 或 'jsdom' 测试浏览器环境
  testMatch: ['<rootDir>/test/**/*.(spec|test).ts']
};

export default config