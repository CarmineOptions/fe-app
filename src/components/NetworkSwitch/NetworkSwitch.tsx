import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { NetworkName } from "../../types/network";
import styles from "./networkswitch.module.css";
import { NETWORK } from "../../constants/amm";

const Ellipse = () => (
  <img
    // TODO: -30px is a hack to cancel MUI styling
    style={{ width: "10px", marginLeft: "10px", marginRight: "-30px" }}
    src="/ellipse.svg"
    alt="green elipse"
  />
);

export const NetworkSwitch = () => {
  const handleChange = (e: SelectChangeEvent) => {
    const target = e.target.value as NetworkName;

    if (target === NetworkName.Mainnet) {
      // TODO: change to mainnet.app.carmine.finance when ready
      window.location.href = "https://app.carmine.finance";
    }
    if (target === NetworkName.Testnet) {
      // TODO: uncomment when ready
      window.location.href = "https://testnet.app.carmine.finance";
    }
  };

  return (
    <FormControl>
      <Select
        id="network-select"
        value={NETWORK}
        displayEmpty
        inputProps={{
          "aria-label": "Without label",
          IconComponent: () => null,
        }}
        onChange={handleChange}
        className={styles.button}
      >
        <MenuItem value="testnet">
          Testnet <Ellipse />
        </MenuItem>
        <MenuItem value="mainnet">
          Mainnet <Ellipse />
        </MenuItem>
      </Select>
    </FormControl>
  );
};
