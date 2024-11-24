import { OptionWithPremia } from "../../classes/Option";
import { TableCell, TableRow, useTheme } from "@mui/material";
import { StarknetIcon } from "../Icons";
import { DefiSpringShortsMessage, DefiSpringTooltip } from "../DefiSpring";

type OptionPreviewProps = {
  option: OptionWithPremia;
  handleClick: () => void;
  defispringApy?: number;
};

const OptionTableItem = ({
  option,
  handleClick,
  defispringApy,
}: OptionPreviewProps) => {
  const theme = useTheme();

  const greyGrade = 800;

  const style = {
    cursor: "pointer",
    "&:hover": {
      background: theme.palette.grey[greyGrade],
    },
  };

  return (
    <TableRow sx={style} onClick={handleClick}>
      <TableCell sx={{ borderBottom: "1px solid white" }}>
        {option.strikeCurrency} {option.strike}
      </TableCell>
      <TableCell sx={{ borderBottom: "1px solid white" }}>
        {option.dateRich}
      </TableCell>
      <TableCell sx={{ borderBottom: "1px solid white" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {option.symbol} {option.displayPremia}
          {option.isShort && (
            <DefiSpringTooltip
              title={<DefiSpringShortsMessage defispringApy={defispringApy} />}
            >
              <div>
                <StarknetIcon style={{ width: "22px", height: "22px" }} />
              </div>
            </DefiSpringTooltip>
          )}
        </div>
      </TableCell>
      <TableCell sx={{ textAlign: "center", borderBottom: "1px solid white" }}>
        <span style={{ color: "#00FF38", fontSize: "20px" }}>+</span>
      </TableCell>
    </TableRow>
  );
};

export default OptionTableItem;
