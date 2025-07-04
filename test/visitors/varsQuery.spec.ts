import { VariableSet } from "../../src/visitors/variableSet";
import { VarsQuery } from "../../src/visitors/varsQuery";

describe("VarsQuery", () => {
  it("should query variables in formula", () => {
    const varQuery = new VarsQuery();
    const result: VariableSet = varQuery.executeSrc(
      "x = y = a + b*(2 + (z = h * i)) - abs(sum(c, d - e/f**g))"
    );
    expect(result.toString()).toBe("x,y,z = a,b,c,d,e,f,g,h,i");
  });

  it("should query variables in if expression", () => {
    const varQuery = new VarsQuery();
    const result: VariableSet = varQuery.executeSrc(
      "if(a == b + c, if (a > d, x = y = m + n, p = q = u + v), z = w * 2)"
    );
    expect(result.toString()).toBe("p,q,x,y,z = a,b,c,d,m,n,u,v,w");
  });

  it("should query variables in formula with instance", () => {
    const varQuery = new VarsQuery();
    const result: VariableSet = varQuery.executeSrc(
      "A.x = A.y = B.a + B.b*(2 + (A.z = C.D.h * C.D.i)) - abs(sum(B.c, B.d - C.D.e/C.D.f**C.D.g))"
    );
    expect(result.toString()).toBe(
      "A.x,A.y,A.z = B.a,B.b,B.c,B.d,C.D.e,C.D.f,C.D.g,C.D.h,C.D.i"
    );
  });

  it("should support a large number of formulas", () => {
    console.groupCollapsed("批量查询变量测试：");
    const cnt = 10000;
    console.log("公式总数：" + cnt);
    const lines: string[] = [];
    const fml =
      "A! = 1 + 2 * 3 - 6 - 1 + B! + C! * (D! - E! + 10 ** 2 / 5 - (12 + 8)) - F! * G! +  100 / 5 ** 2 ** 1";

    for (let i = 1; i <= cnt; i++) {
      lines.push(fml.replace(/!/g, String(i)));
    }
    const start = Date.now();
    const varQuery = new VarsQuery();
    let result: VariableSet | null = null;
    for (let i = 0; i < lines.length; i++) {
      const expr = lines[i];
      result = varQuery.executeSrc(expr);
    }
    console.log(result);
    console.log("time: " + (Date.now() - start) + "ms");
    console.log("==========");
    console.groupEnd();
  });
});
