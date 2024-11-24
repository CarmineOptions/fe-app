const MAX = 99999999;

export const handleNumericChangeFactory =
  (
    setInputText: (v: string) => void,
    setAmount: (v: number) => void,
    cb?: (v: number) => number
  ) =>
  (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const valueIn = e.target.value.replace(",", ".");

    // smallest allowed number: 0.000001
    if (!/^\d*\.{0,1}\d{0,6}$/.test(valueIn)) {
      return;
    }

    const parsed = parseFloat(valueIn);

    if (parsed > MAX) {
      return;
    }

    if (valueIn === ".") {
      setInputText("0.");
      setAmount(0);
      return;
    }
    if (valueIn === "" || isNaN(parsed)) {
      setInputText("");
      setAmount(0);
      return;
    }

    if (cb) {
      const res = cb(parsed);
      setInputText(res === parsed ? valueIn : res.toString());
      setAmount(res);
      return;
    }
    setInputText(valueIn);
    setAmount(parsed);
  };
