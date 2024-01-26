import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { useState } from "react";

import { OptionWithPremia } from "../../classes/Option";
import tableStyles from "../../style/table.module.css";
import { SlippageButton } from "../Slippage/SlippageButton";
import { OptionModal } from "./OptionModal";
import OptionsTableItem from "./OptionTableItem";

type Props = {
  options: OptionWithPremia[];
};

const OptionsTable = ({ options }: Props) => {
  const [modalOption, setModalOption] = useState<OptionWithPremia>(options[0]);
  const [open, setOpen] = useState<boolean>(false);
  const [priceSort, setPriceSort] = useState(false);
  const [maturitySort, setMaturitySort] = useState(false);
  const [filterOption, setFilterOption] = useState(1);

  const handleOptionClick = (o: OptionWithPremia) => {
    setModalOption(o);
    setOpen(true);
    o.sendViewEvent();
  };

  return (
    <>
      <Table className={tableStyles.table} aria-label="simple table">
        <TableHead>
          <TableRow sx={{ border: "1px solid white ", cursor:'pointer' }}>
            <TableCell
              onClick={() => {
                setFilterOption(1);
                setPriceSort(!priceSort);
              }}
            >
              Strike Price
            </TableCell>
            <TableCell
              onClick={() => {
                setFilterOption(2);
                setMaturitySort(!maturitySort);
              }}
            >
              Maturity
            </TableCell>
            <TableCell>Premia</TableCell>
            <TableCell className={tableStyles.slippageCell}>
              <SlippageButton />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filterOption === 1 &&
            options
              .sort((a, b) =>
                priceSort ? b.strike - a.strike : a.strike - b.strike
              )
              .map((o, i: number) => (
                <OptionsTableItem
                  option={o}
                  handleClick={() => handleOptionClick(o)}
                  key={i}
                />
              ))}
          {filterOption === 2 &&
            options
              .sort((a, b) =>
                maturitySort ? b.maturity - a.maturity : a.maturity - b.maturity
              )
              .map((o, i: number) => (
                <OptionsTableItem
                  option={o}
                  handleClick={() => handleOptionClick(o)}
                  key={i}
                />
              ))}
        </TableBody>
      </Table>
      <OptionModal open={open} setOpen={setOpen} option={modalOption} />
    </>
  );
};

export default OptionsTable;
