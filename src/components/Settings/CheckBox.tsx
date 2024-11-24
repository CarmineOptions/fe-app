import { Grid, Switch, Typography } from "@mui/material";
import { ChangeEvent } from "react";
import { RootState } from "../../redux/store";
import { updateSettings } from "../../redux/actions";
import { useSelector } from "react-redux";

export const CheckBox = () => {
  const { autoconnect } = useSelector((s: RootState) => s.settings);

  const handleAutoconnect = (e: ChangeEvent, checked: boolean) => {
    updateSettings({ autoconnect: checked });
  };

  const style = {
    maxWidth: "66ch",
    alignItems: "center",
  };

  return (
    <Grid container sx={style}>
      <Grid item xs={12} md={6}>
        <Typography fontWeight="bold">Autoconnect</Typography>
      </Grid>
      <Grid item xs={4} md={2}>
        disabled
      </Grid>
      <Grid item xs={4} md={2}>
        <Switch
          inputProps={{ "aria-label": "controlled" }}
          checked={autoconnect}
          onChange={handleAutoconnect}
          color="primary"
        />
      </Grid>
      <Grid item xs={4} md={2}>
        allowed
      </Grid>
    </Grid>
  );
};
