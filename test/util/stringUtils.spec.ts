import { StringUtils } from '../../src/util/stringUtils';

describe('StringUtils', () => {
  describe('clean', () => {
    it('should return empty string for null/undefined', () => {
      expect(StringUtils.clean(null)).toBe('');
      expect(StringUtils.clean(undefined)).toBe('');
    });
    it('should trim normal string', () => {
      expect(StringUtils.clean('  abc  ')).toBe('abc');
    });
    it('should trim empty string', () => {
      expect(StringUtils.clean('   ')).toBe('');
      expect(StringUtils.clean('')).toBe('');
    });
  });

  describe('trim', () => {
    it('should return null for null/undefined', () => {
      expect(StringUtils.trim(null)).toBeNull();
      expect(StringUtils.trim(undefined)).toBeNull();
    });
    it('should trim normal string', () => {
      expect(StringUtils.trim('  abc  ')).toBe('abc');
    });
    it('should trim empty string', () => {
      expect(StringUtils.trim('   ')).toBe('');
      expect(StringUtils.trim('')).toBe('');
    });
  });

  describe('isNotEmpty/isEmpty', () => {
    it('should handle null/undefined/empty', () => {
      expect(StringUtils.isEmpty(null)).toBe(true);
      expect(StringUtils.isEmpty(undefined)).toBe(true);
      expect(StringUtils.isEmpty('')).toBe(true);
      expect(StringUtils.isNotEmpty(null)).toBe(false);
      expect(StringUtils.isNotEmpty(undefined)).toBe(false);
      expect(StringUtils.isNotEmpty('')).toBe(false);
    });
    it('should handle non-empty string', () => {
      expect(StringUtils.isEmpty('abc')).toBe(false);
      expect(StringUtils.isNotEmpty('abc')).toBe(true);
    });
    it('should treat blank string as not empty', () => {
      expect(StringUtils.isEmpty('   ')).toBe(false);
      expect(StringUtils.isNotEmpty('   ')).toBe(true);
    });
  });

  describe('isBlank/isNotBlank', () => {
    it('should handle null/undefined/empty', () => {
      expect(StringUtils.isBlank(null)).toBe(true);
      expect(StringUtils.isBlank(undefined)).toBe(true);
      expect(StringUtils.isBlank('')).toBe(true);
      expect(StringUtils.isNotBlank(null)).toBe(false);
      expect(StringUtils.isNotBlank(undefined)).toBe(false);
      expect(StringUtils.isNotBlank('')).toBe(false);
    });
    it('should handle blank string', () => {
      expect(StringUtils.isBlank('   ')).toBe(true);
      expect(StringUtils.isNotBlank('   ')).toBe(false);
    });
    it('should handle non-blank string', () => {
      expect(StringUtils.isBlank('abc')).toBe(false);
      expect(StringUtils.isNotBlank('abc')).toBe(true);
    });
  });

  describe('equals', () => {
    it('should handle null/undefined', () => {
      expect(StringUtils.equals(null, null)).toBe(true);
      expect(StringUtils.equals(undefined, undefined)).toBe(true);
      expect(StringUtils.equals(null, undefined)).toBe(true);
      expect(StringUtils.equals(null, 'abc')).toBe(false);
      expect(StringUtils.equals('abc', null)).toBe(false);
    });
    it('should compare strings', () => {
      expect(StringUtils.equals('abc', 'abc')).toBe(true);
      expect(StringUtils.equals('abc', 'ABC')).toBe(false);
    });
  });

  describe('equalsIgnoreCase', () => {
    it('should handle null/undefined', () => {
      expect(StringUtils.equalsIgnoreCase(null, null)).toBe(true);
      expect(StringUtils.equalsIgnoreCase(undefined, undefined)).toBe(true);
      expect(StringUtils.equalsIgnoreCase(null, undefined)).toBe(true);
      expect(StringUtils.equalsIgnoreCase(null, 'abc')).toBe(false);
      expect(StringUtils.equalsIgnoreCase('abc', null)).toBe(false);
    });
    it('should compare strings ignoring case', () => {
      expect(StringUtils.equalsIgnoreCase('abc', 'ABC')).toBe(true);
      expect(StringUtils.equalsIgnoreCase('abc', 'Abc')).toBe(true);
      expect(StringUtils.equalsIgnoreCase('abc', 'def')).toBe(false);
    });
  });
});
