import { Option } from "../classes/Option";
import { getToApprove, longInteger } from "./computations";

type ToApproveDataset = {
  size: number;
  premia: bigint;
  correct: bigint;
};

const longCallDataset: ToApproveDataset[] = [
  {
    size: 1,
    premia: 145645927995050205n,
    correct: 160210520794555225n,
  },
];

const shortCallDataset: ToApproveDataset[] = [
  {
    size: 1,
    premia: 145645927995050205n,
    correct: 868918664804454816n,
  },
];

const longPutDataset: ToApproveDataset[] = [
  {
    size: 1,
    premia: 145645927995050205n,
    correct: 160210520794555225n,
  },
];

const shortPutDataset: ToApproveDataset[] = [
  {
    size: 1,
    premia: 178503892n,
    correct: 1039346498n,
  },
];

describe("approve amount", () => {
  test("LONG CALL", () => {
    longCallDataset.forEach(({ size, premia, correct }) => {
      const mockOption = { isCall: true, isLong: true, strike: 1000 };
      const res = getToApprove(mockOption as Option, size, premia);
      expect(res === correct).toBe(true);
    });
  });
  test("SHORT CALL", () => {
    shortCallDataset.forEach(({ size, premia, correct }) => {
      const mockOption = { isCall: true, isLong: false, strike: 1000 };
      const res = getToApprove(mockOption as Option, size, premia);
      expect(res === correct).toBe(true);
    });
  });
  test("LONG PUT", () => {
    longPutDataset.forEach(({ size, premia, correct }) => {
      const mockOption = { isCall: false, isLong: true, strike: 1000 };
      const res = getToApprove(mockOption as Option, size, premia);
      expect(res === correct).toBe(true);
    });
  });
  test("SHORT PUT", () => {
    shortPutDataset.forEach(({ size, premia, correct }) => {
      const mockOption = { isCall: false, isLong: false, strike: 1200 };
      const res = getToApprove(mockOption as Option, size, premia);
      expect(res === correct).toBe(true);
    });
  });
});

describe("long integer", () => {
  test("18 digits, n > 1", () => {
    const input = 100.00123;
    const expectedResult = 100001230000000000000n;
    const res = longInteger(input, 18);
    expect(res === expectedResult).toBe(true);
  });

  test("18 digits, n < 1", () => {
    const input = 0.00000123;
    const expectedResult = 1230000000000n;
    const res = longInteger(input, 18);
    expect(res === expectedResult).toBe(true);
  });

  test("18 digits, n == 1", () => {
    const input = 1;
    const expectedResult = 1000000000000000000n;
    const res = longInteger(input, 18);
    expect(res === expectedResult).toBe(true);
  });

  test("more digits than requested", () => {
    const input = 0.123456789;
    const expectedResult = 123n;
    const res = longInteger(input, 3);
    expect(res === expectedResult).toBe(true);
  });

  test("scientific notation", () => {
    const input = 1.0679258529442e-7;
    const expectedResult = 106792585294n;
    const res = longInteger(input, 18);
    expect(res === expectedResult).toBe(true);
  });
});

export {};
