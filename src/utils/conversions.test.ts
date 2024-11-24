import { stringToBigint } from "./conversions";

describe("convert text to felt", () => {
  const cases: [string, bigint][] = [
    ["STRK-USDC-CALL-LONG", 1858307286577880742802534252795740158654631495n],
    ["STRK-USDC-CALL-SHORT", 475726665363937470157448768715709480645533061716n],
    ["STRK-USDC-PUT-LONG", 7259012838194846651572400367370245491347015n],
    ["STRK-USDC-PUT-SHORT", 1858307286577880742802534494046782875732234836n],
    ["ETH-USDC-CALL-LONG", 6039427387912472877549585711181846421655111n],
    ["ETH-USDC-CALL-SHORT", 1546093411305593056652693942062552713891107412n],
  ];

  test("pool names", () => {
    cases.forEach(([text, felt]) => {
      const result = stringToBigint(text);
      expect(result === felt).toBe(true);
    });
  });
});

export {};
