import { BitSet } from "../../src/util/bitSet";

describe("BitSet", () => {
  it("should set and get bits correctly", () => {
    const bs = new BitSet();
    bs.set(0);
    bs.set(63);
    bs.set(64);
    expect(bs.get(0)).toBe(true);
    expect(bs.get(63)).toBe(true);
    expect(bs.get(64)).toBe(true);
    expect(bs.get(1)).toBe(false);
    expect(bs.get(100)).toBe(false);
  });

  it("should handle large indices", () => {
    const bs = new BitSet();
    bs.set(10000);
    expect(bs.get(10000)).toBe(true);
    expect(bs.get(999)).toBe(false);
  });

  it("should clear bits correctly", () => {
    const bs = new BitSet();
    bs.set(10);
    expect(bs.get(10)).toBe(true);
    bs.clear(10);
    expect(bs.get(10)).toBe(false);
  });

  it("should convert to and from byte array", () => {
    const bs = new BitSet();
    bs.set(0);
    bs.set(8);
    bs.set(15);
    bs.set(10000);
    const arr = bs.toByteArray();
    expect(arr).toBeInstanceOf(Uint8Array);
    const bs2 = BitSet.valueOf(arr);
    expect(bs2.get(0)).toBe(true);
    expect(bs2.get(8)).toBe(true);
    expect(bs2.get(15)).toBe(true);
    expect(bs2.get(1)).toBe(false);
  });

  it("toString should show set bits", () => {
    const bs = new BitSet();
    expect(bs.toString()).toBe("{}");
    bs.set(1);
    bs.set(3);
    expect(bs.toString()).toContain("1");
    expect(bs.toString()).toContain("3");
  });
});
