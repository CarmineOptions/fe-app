import { Typography } from "@mui/material";
import { CheckBox } from "../components/Settings/CheckBox";
import { Layout } from "../components/Layout";

const Settings = () => {
  return (
    <Layout>
      <Typography sx={{ mb: 2 }} variant="h4">
        Settings
      </Typography>
      <Typography sx={{ maxWidth: "66ch" }}>
        The settings are stored in the localStorage - they are persistent per
        device and only if the usage of local storage is available.
      </Typography>
      <br />
      <CheckBox />
    </Layout>
  );
};

export default Settings;
