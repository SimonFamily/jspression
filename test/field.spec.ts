import { Field } from '../src/field';

describe('Field', () => {
  it('should parse dot-separated string and toString correctly', () => {
    let src = 'a.b.c.d';
    let field = Field.valueOf(src);
    expect(field.toString()).toBe(src);
  });

  it('should handle single name', () => {
    const src = 'table1';
    const field = Field.valueOf(src);
    expect(field.toString()).toBe(src);
    expect(field.getName()).toBe('table1');
    expect(field.getOwner()).toBeNull();
  });

  it('should handle nested field', () => {
    const owner = Field.valueOf('table1');
    const field = new Field('field1', owner);
    expect(field.toString()).toBe('table1.field1');
    expect(field.getName()).toBe('field1');
    expect(field.getOwner()).toBe(owner);
  });

  it('should handle root field', () => {
    const field = new Field('f1');
    expect(field.toString()).toBe('f1');
    expect(field.getName()).toBe('f1');
    expect(field.getOwner()).toBeNull();
  });

  it('should handle repeated toString calls (cache)', () => {
    const field = Field.valueOf('a.b');
    const s1 = field.toString();
    const s2 = field.toString();
    expect(s1).toBe('a.b');
    expect(s2).toBe('a.b');
  });
});