import { math64toDecimal, decimalToMath64 } from "./units";

const math64toDecimalTestCases = [
  { test: "283902308823417640452", correct: 123.123 },
];
const decimalToMath64TestCases = [
  { test: 123.123, correct: "283902308823417640452" },
];

describe("unit conversion", () => {
  test("math64 -> decimal", () => {
    math64toDecimalTestCases.forEach(({ test, correct }) =>
      expect(math64toDecimal(test)).toBe(correct)
    );
  });

  test("decimal -> math64", () => {
    decimalToMath64TestCases.forEach(({ test, correct }) =>
      expect(decimalToMath64(test)).toBe(correct)
    );
  });
});
