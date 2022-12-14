import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { RootState } from "../redux/store";
import { Envs } from "../redux/reducers/environment";
import { useSelector } from "react-redux";
import { storeUsedNetwork } from "../utils/environment";

export const NetworkSwitch = () => {
  const currentEnv = useSelector(
    (s: RootState) => s.environmentSwitch.currentEnv
  );

  const handleChange = (e: SelectChangeEvent) => {
    const newEnv = e.target.value as Envs;
    storeUsedNetwork(newEnv);
    // the most reliable way to make sure that all contracts and StarknetProvider
    // use correct network is to reload the app
    window.location.reload();
  };

  // do not show Testnet2 in prod
  const isDev =
    new URL(window.location.href).hostname !== "app.carmine.finance";

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="network-select-label">Network</InputLabel>
        <Select
          labelId="network-select-label"
          id="network-select"
          value={currentEnv}
          label="Network"
          onChange={handleChange}
        >
          {process.env.NODE_ENV === "development" ? (
            <MenuItem value={Envs.Devnet}>Devnet</MenuItem>
          ) : null}
          <MenuItem value={Envs.Testnet}>Testnet</MenuItem>
          {isDev ? <MenuItem value={Envs.Testnet2}>Testnet 2</MenuItem> : null}
          {isDev ? <MenuItem value={Envs.Testdev}>Testdev</MenuItem> : null}
          <MenuItem disabled={true} value={Envs.Mainnet}>
            Mainnet - comming soon!
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};
