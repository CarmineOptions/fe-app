import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
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

export const NetworkSwitch = () => (
  <FormControl>
    <Select
      id="network-select"
      value={NETWORK}
      displayEmpty
      inputProps={{
        "aria-label": "Without label",
        IconComponent: () => null,
      }}
      className={styles.button}
    >
      <MenuItem className={styles.menuitem} value="testnet">
        <a
          className={styles.itemlink}
          href="https://testnet.app.carmine.finance/"
        >
          <div>
            <span>Testnet </span>
            <Ellipse />
          </div>
        </a>
      </MenuItem>
      <MenuItem className={styles.menuitem} value="mainnet">
        <a className={styles.itemlink} href="https://app.carmine.finance/">
          <div>
            <span>Mainnet </span>
            <Ellipse />
          </div>
        </a>
      </MenuItem>
    </Select>
  </FormControl>
);
