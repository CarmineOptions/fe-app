import { useState } from "react";
import toast from "react-hot-toast";

import styles from "./prop.module.css";
import { IconButton, MenuItem, Select, Tooltip } from "@mui/material";
import { Pool } from "../../classes/Pool";
import { STRK_ADDRESS, USDC_ADDRESS, AMM_ADDRESS } from "../../constants/amm";
import { OptionType } from "../../types/options";
import { PairNamedBadge } from "../TokenBadge";
import { LoadingAnimation } from "../Loading/Loading";
import { handleDuplicates, suggestOptions } from "./suggest";
import { timestampToDateAndTime } from "../../utils/utils";
import { decimalToMath64 } from "../../utils/units";
import { Close } from "@mui/icons-material";
import { ProposalText } from "./ProposalText";
import { proposeOptions } from "./proposeOptions";
import { useAccount, useSendTransaction } from "@starknet-react/core";
import { useOptions } from "../../hooks/useOptions";
import { stringToBigint } from "../../utils/conversions";
import { pools } from "./pools";

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
  const { isLoading, isError, options: data } = useOptions();
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
      <div className={styles.buttonscontainer}>
        <div className={styles.buttons}>
          <Select
            value={selectedMaturity}
            onChange={(e) => setSelectedMaturity(e.target.value as number)}
            sx={{
              ".css-1ly9a1d-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input":
                {
                  padding: "5px",
                  display: "flex",
                  alignItems: "center",
                },
            }}
          >
            {maturities.map((maturity, i) => {
              const [date] = timestampToDateAndTime(maturity * 1000);
              return (
                <MenuItem key={i} value={maturity}>
                  <p>{date}</p>
                </MenuItem>
              );
            })}
          </Select>
          <button className="secondary active" onClick={handleSuggest}>
            Suggest
          </button>
        </div>
        <div className={styles.buttons}>
          <button className="secondary active" onClick={handleAddOption}>
            Add option
          </button>
          <button className="secondary active" onClick={handleSubmit}>
            Submit
          </button>
          <button className="secondary active" onClick={handleDownload}>
            Download
          </button>
        </div>
        <div className={styles.buttons}>
          <button className="secondary active" onClick={handleLoad}>
            Load
          </button>
          <button className="secondary active" onClick={handleSave}>
            Save
          </button>
          <button className="secondary active" onClick={handleClear}>
            Clear
          </button>
        </div>
      </div>
      <div className={styles.optionboxcontainer}>
        {options.map((option, index) => (
          <div key={index} className={styles.optionbox}>
            <div className={styles.close}>
              <div>
                {option.active === false && (
                  <Tooltip title="Duplicates are not included in the final payload">
                    <div className={styles.infobox}>
                      <p className="error-col">This option is a duplicate</p>
                    </div>
                  </Tooltip>
                )}
              </div>
              <Tooltip title="Remove this option">
                <IconButton
                  sx={{ minWidth: 0 }}
                  onClick={() => handleRemove(index)}
                >
                  <Close />
                </IconButton>
              </Tooltip>
            </div>

            <div>
              <p>Pool</p>
              <Select
                value={option.pool}
                onChange={(e) => handleChange(index, "pool", e.target.value)}
                sx={{
                  ".css-1ly9a1d-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input":
                    { padding: "5px", display: "flex" },
                }}
              >
                {pools.map((pool, i) => (
                  <MenuItem key={i} value={pool.poolId}>
                    <div className={styles.poolselect}>
                      <PairNamedBadge
                        tokenA={pool.baseToken}
                        tokenB={pool.quoteToken}
                        size="small"
                      />
                      {pool.typeAsText}
                    </div>
                  </MenuItem>
                ))}
              </Select>
            </div>
            <div>
              <p>Maturity</p>
              <Select
                value={option.maturity}
                onChange={(e) =>
                  handleChange(index, "maturity", e.target.value)
                }
                sx={{
                  width: "100%",
                  ".css-1ly9a1d-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input":
                    {
                      padding: "5px",
                      display: "flex",
                      alignItems: "center",
                    },
                }}
              >
                {maturities.map((maturity, i) => {
                  const [date] = timestampToDateAndTime(maturity * 1000);
                  return (
                    <MenuItem key={i} value={maturity}>
                      <p>{date}</p>
                    </MenuItem>
                  );
                })}
              </Select>
            </div>
            <div>
              <p>Strike Price</p>
              <input
                type="number"
                placeholder="Strike Price"
                value={option.strike}
                onChange={(e) =>
                  handleChange(index, "strike", parseFloat(e.target.value))
                }
              />
            </div>
            <div>
              <p>Volatility</p>
              <input
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
