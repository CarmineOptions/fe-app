import Typography from "@mui/material/Typography";
import { Box, Button, Link, useTheme } from "@mui/material";
import { useEffect } from "react";
import { setCookieWithExpiry } from "../utils/cookies";

const HIDE_TIME_MS = 1000 * 60 * 30; // 12 hours in ms

const storeTermsAndConditions = (
  check: boolean,
  rerender: (b: boolean) => void
) => {
  setCookieWithExpiry("carmine-t&c", "accepted", HIDE_TIME_MS);
  rerender(!check);
};

type Props = {
  rerender: (b: boolean) => void;
  check: boolean;
};

const TermsAndConditions = ({ check, rerender }: Props) => {
  useEffect(() => {
    document.title = "Discord Warning | Carmine Finance";
  });

  const theme = useTheme();

  const style = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    gap: 4,
    textAlign: "center",
    [theme.breakpoints.up("sm")]: {
      padding: "0 20vw",
    },
    [theme.breakpoints.down("sm")]: {
      padding: "0 20px",
    },
  };

  // TODO: master URL when merged
  const termsUrl =
    "https://github.com/CarmineOptions/fe-app/blob/development/TermsOfUse.md";

  return (
    <Box sx={style}>
      <Typography variant="h4">Discord Warning</Typography>
      <Typography variant="body1">
        Our Discord has been hacked and the core team does not have access to it
        at this time. We urge you to ignore any announcement and information you
        found on Discord!
      </Typography>
      <Button
        variant="contained"
        onClick={() => storeTermsAndConditions(check, rerender)}
      >
        I am aware of this
      </Button>
    </Box>
  );
};

export default TermsAndConditions;
