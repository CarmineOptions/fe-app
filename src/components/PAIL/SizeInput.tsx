import { ChangeEvent, CSSProperties, useState } from "react";

type Props = {
  size: number;
  setSize: (n: number) => void;
};

export const SizeInput = ({ size, setSize }: Props) => {
  const [displayValue, setDisplayValue] = useState(size.toString());

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    inputValue = inputValue.replace(/^0{2,}/, "0"); // replace two leading 0 by one
    inputValue = inputValue.replace(/^0(?=[1-9])/, ""); // remove leading 0 if followed by number

    if (inputValue === "") {
      setDisplayValue("");
      setSize(0);
      return;
    }

    const pattern = /^[0-9]+(?:[.,][0-9]*)?$/;

    if (!pattern.test(inputValue)) {
      return;
    }

    setDisplayValue(inputValue.replace(",", "."));
    const n = parseFloat(inputValue);
    setSize(n);
  };
  return (
    <div>
      <input
        onChange={handleChange}
        type="text"
        placeholder="Size"
        value={displayValue}
        style={
          {
            fieldSizing: "content",
          } as CSSProperties
        }
        className="bg-dark-card border-dark-primary text-center border-[1px] min-w-32 h-10 py-2 px-4 rounded-full"
      />
    </div>
  );
};
