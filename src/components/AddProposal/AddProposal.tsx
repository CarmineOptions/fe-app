import { useState } from "react";
import toast from "react-hot-toast";
import { Close } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { Pool } from "../../classes/Pool";
import { STRK_ADDRESS, USDC_ADDRESS, AMM_ADDRESS } from "../../constants/amm";
import { OptionType } from "../../types/options";
import { LoadingAnimation } from "../Loading/Loading";
import { handleDuplicates, suggestOptions } from "./suggest";
import { decimalToMath64 } from "../../utils/units";

import { ProposalText } from "./ProposalText";
import { proposeOptions } from "./proposeOptions";
import { useAccount, useSendTransaction } from "@starknet-react/core";
import { useOptionsAllPools } from "../../hooks/useOptions";
import { stringToBigint } from "../../utils/conversions";
import { pools } from "./pools";
import { Button, P3 } from "../common";
import { MaturitySelect, PoolSelect } from "../TokenPairSelect";

const defaultOptionValue: ProposalOption = {
  pool: new Pool(STRK_ADDRESS, USDC_ADDRESS, OptionType.Call).poolId,
  maturity: 1735056000,
  strike: 0.4,
  volatility: 90,
  active: false,
};

export type ProposalOption = {
  pool: string;
  maturity: number;
  strike: number;
  volatility: number;
  active?: boolean;
};

const getRelevantMaturities = (count = 20, offset = 1) => {
  const SOME_THURSDAY = 1726790399;
  const WEEK = 604800;

  const now = Math.round(Date.now() / 1000);
  const nextThursday = now - ((now - SOME_THURSDAY) % WEEK) + WEEK;

  const firstMaturity = nextThursday + offset * WEEK;

  const maturities = Array.from(
    { length: count },
    (_, i) => firstMaturity + i * WEEK
  );

  return maturities;
};

export const AddProposal = () => {
  const { account } = useAccount();
  const { sendAsync } = useSendTransaction({});
  const { isLoading, isError, options: data } = useOptionsAllPools();
  const [options, setOptions] = useState<ProposalOption[]>([]);
  const maturities = getRelevantMaturities();

  const [selectedMaturity, setSelectedMaturity] = useState<number>(
    maturities[0]
  );

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (isError || !data) {
    return <p>Something went wrong</p>;
  }

  const handleAddOption = () => {
    setOptions([defaultOptionValue, ...options]);
  };

  const handleChange = <T,>(index: number, field: string, value: T) => {
    const updatedOptions = options.map((option, i) =>
      i === index ? { ...option, [field]: value } : option
    );
    setOptions(handleDuplicates(updatedOptions, data));
  };

  const handleRemove = (index: number) => {
    const optionsWithoutElement = options.filter((_, i) => i !== index);
    setOptions(optionsWithoutElement);
    toast.success("Proposal option removed");
  };

  const handleSuggest = () => {
    suggestOptions(data, selectedMaturity).then((suggestedOptions) => {
      // ignore duplicates
      const newOptions = [...options, ...suggestedOptions].filter(
        (obj, index, self) =>
          index ===
          self.findIndex(
            (o) =>
              o.maturity === obj.maturity &&
              o.strike === obj.strike &&
              o.pool === obj.pool
          )
      );
      setOptions(newOptions);
    });
  };

  const handleClear = () => setOptions([]);

  const handleSave = () => {
    localStorage.setItem("options-proposal-save", JSON.stringify(options));
    toast.success("Proposal options saved");
  };

  const handleLoad = () => {
    const loadedData = localStorage.getItem("options-proposal-save");

    if (loadedData === null) {
      toast("Did not find any saved data");
      return;
    }

    try {
      const parsed = JSON.parse(loadedData);
      setOptions(parsed);
      toast.success("Proposal options loaded");
    } catch (e) {
      console.error(e);
      toast.error("Failed to read saved data");
    }
  };

  const getPayload = () => {
    const data = options
      .filter((o) => o.active !== false) // filter out active = false (duplicate with live options)
      .flatMap((o) => {
        const pool = pools.find((p) => p.poolId === o.pool);
        if (!pool) {
          throw Error("Could not find pool");
        }
        const name = `${pool.baseToken.symbol}-${
          pool.quoteToken.symbol
        }-${pool.typeAsText.toUpperCase()}-`;
        return [
          stringToBigint(name + "LONG").toString(10),
          stringToBigint(name + "SHORT").toString(10),
          o.maturity.toString(10),
          decimalToMath64(o.strike),
          "0", // Fixed sign
          BigInt(pool.type).toString(10),
          BigInt(pool.lpAddress).toString(10),
          BigInt(pool.quoteToken.address).toString(10),
          BigInt(pool.baseToken.address).toString(10),
          decimalToMath64(o.volatility),
          "0", // Fixed sign
        ];
      });
    const calldata = [
      2, // add options custom proposal prop id
      data.length + 2, // length of the payload Span<felt252>
      BigInt(AMM_ADDRESS).toString(10),
      data.length / 11, // length of the array of options (each option is 11 fields)
      ...data,
    ];
    return calldata;
  };

  const handleSubmit = () => {
    if (options.length === 0) {
      toast.error("No options selected");
      return;
    }
    if (!account) {
      toast.error("Connect wallet to submit options");
      return;
    }
    proposeOptions(getPayload(), sendAsync);
  };

  const handleDownload = () => {
    if (options.length === 0) {
      toast.error("No options selected");
      return;
    }
    const payload = getPayload();
    const calldata = [
      "2", // add options custom proposal prop id
      payload.length + 2, // length of the payload Span<felt252>
      BigInt(AMM_ADDRESS).toString(),
      payload.length / 11, // length of the array of options (each option is 11 fields)
      ...payload,
    ];
    const content = JSON.stringify(calldata).replaceAll('"', "");
    const blob = new Blob([content], { type: "text/plain" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "options-payload.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <MaturitySelect
            maturities={maturities}
            maturity={selectedMaturity}
            setMaturity={setSelectedMaturity}
          />
          <Button type="secondary" onClick={handleSuggest}>
            Suggest
          </Button>
        </div>
        <div className="flex gap-3">
          <Button type="secondary" onClick={handleAddOption}>
            Add option
          </Button>
          <Button type="secondary" onClick={handleSubmit}>
            Submit
          </Button>
          <Button type="secondary" onClick={handleDownload}>
            Download
          </Button>
        </div>
        <div className="flex gap-3">
          <Button type="secondary" onClick={handleLoad}>
            Load
          </Button>
          <Button type="secondary" onClick={handleSave}>
            Save
          </Button>
          <Button type="secondary" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap justify-between gap-4 mt-3 rounded-md">
        {options.map((option, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 border-dark-tertiary border-2 rounded-md text-dark-primary w-[280px] p-3"
          >
            <div className="flex justify-between items-center">
              <div>
                {option.active === false && (
                  <Tooltip title="Duplicates are not included in the final payload">
                    <div className="w-fit bg-ui-errorBg px-2 py-1 rounded-md h-full">
                      <P3 className="text-ui-errorAccent">
                        This option is a duplicate
                      </P3>
                    </div>
                  </Tooltip>
                )}
              </div>
              <Tooltip title="Remove this option">
                <div className="w-5 h-5 text-dark-primary rounded-md flex justify-center items-center">
                  <IconButton
                    className="w-full h-full"
                    sx={{ color: "white" }}
                    onClick={() => handleRemove(index)}
                  >
                    <Close />
                  </IconButton>
                </div>
              </Tooltip>
            </div>

            <div className="w-full flex justify-between items-center">
              <p>Pool</p>
              <PoolSelect
                pool={pools.find((p) => p.poolId === options[index].pool)!}
                setPool={(poolId) => handleChange(index, "pool", poolId)}
              />
            </div>
            <div className="w-full flex justify-between items-center">
              <p>Maturity</p>
              <MaturitySelect
                maturity={option.maturity}
                setMaturity={(m) => handleChange(index, "maturity", m)}
                maturities={maturities}
              />
            </div>
            <div className="w-full flex justify-between items-center">
              <p>Strike Price</p>
              <input
                className="bg-dark w-20 text-center"
                type="number"
                placeholder="Strike Price"
                value={option.strike}
                onChange={(e) =>
                  handleChange(index, "strike", parseFloat(e.target.value))
                }
              />
            </div>
            <div className="w-full flex justify-between items-center">
              <p>Volatility</p>
              <input
                className="bg-dark w-20 text-center"
                type="number"
                placeholder="Volatility"
                value={option.volatility}
                onChange={(e) =>
                  handleChange(index, "volatility", parseFloat(e.target.value))
                }
              />
            </div>
          </div>
        ))}
      </div>
      {options.length > 0 && <ProposalText proposalOptions={options} />}
    </div>
  );
};
