import { describe, expect, it } from "vitest";
import { evaluateSheet, expandRange, fmt, FormulaError } from "@/lib/excel-formula";

const ev = (sheet: Record<string, string>, ref: string) => fmt(evaluateSheet(sheet)[ref]);

describe("excel formula", () => {
  it("arifmetika va amal tartibi", () => {
    expect(ev({ A1: "5000", B1: "3", C1: "=A1*B1" }, "C1")).toBe("15000");
    expect(ev({ A1: "=2+3*4" }, "A1")).toBe("14");
    expect(ev({ A1: "=(2+3)*4" }, "A1")).toBe("20");
    expect(ev({ A1: "=2^3" }, "A1")).toBe("8");
    expect(ev({ A1: "=-3+10" }, "A1")).toBe("7");
  });

  it("SUM, AVERAGE, MAX, MIN, COUNT", () => {
    const s = { B2: "85", B3: "97", B4: "64", B5: "78", B6: "91", B7: "matn" };
    expect(ev({ ...s, C1: "=SUM(B2:B6)" }, "C1")).toBe("415");
    expect(ev({ ...s, C1: "=AVERAGE(B2:B6)" }, "C1")).toBe("83");
    expect(ev({ ...s, C1: "=MAX(B2:B6)" }, "C1")).toBe("97");
    expect(ev({ ...s, C1: "=MIN(B2:B6)" }, "C1")).toBe("64");
    expect(ev({ ...s, C1: "=COUNT(B2:B7)" }, "C1")).toBe("5");
  });

  it("ruscha nomlar va ; ajratkich", () => {
    expect(ev({ A1: "2", A2: "4", B1: "=СУММ(A1:A2)" }, "B1")).toBe("6");
    expect(ev({ A1: "95", B1: '=ЕСЛИ(A1>=90;"A\'lo";"Yaxshi")' }, "B1")).toBe("A'lo");
  });

  it("IF, COUNTIF, SUMIF, ROUND", () => {
    const s = { B2: "o'g'il", B3: "qiz", B4: "o'g'il", B5: "qiz", C2: "92", C3: "97", C4: "64", C5: "88" };
    expect(ev({ ...s, D1: '=IF(C4>=90;"A\'lo";"Yaxshi")' }, "D1")).toBe("Yaxshi");
    expect(ev({ ...s, D1: '=COUNTIF(C2:C5;">=90")' }, "D1")).toBe("2");
    expect(ev({ ...s, D1: '=COUNTIF(B2:B5;"qiz")' }, "D1")).toBe("2");
    expect(ev({ ...s, D1: '=SUMIF(B2:B5;"qiz";C2:C5)' }, "D1")).toBe("185");
    expect(ev({ ...s, D1: "=ROUND(AVERAGE(C2:C5);1)" }, "D1")).toBe("85.3");
  });

  it("xatolar", () => {
    const r = evaluateSheet({ A1: "=1/0", B1: "=B1+1", C1: "=FOO(1)", D1: "=A1+" });
    expect(r.A1).toBeInstanceOf(FormulaError);
    expect(r.B1).toBeInstanceOf(FormulaError);
    expect(r.C1).toBeInstanceOf(FormulaError);
    expect(r.D1).toBeInstanceOf(FormulaError);
    expect(fmt(r.A1)).toBe("#XATO");
  });

  it("bog'liq kataklar", () => {
    expect(ev({ A1: "2", A2: "=A1*2", A3: "=A2*2" }, "A3")).toBe("8");
  });

  it("diapazon", () => {
    expect(expandRange("A1", "B2")).toEqual(["A1", "B1", "A2", "B2"]);
  });
});
