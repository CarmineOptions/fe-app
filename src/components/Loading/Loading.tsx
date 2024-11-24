import { Box, CircularProgress } from "@mui/material";

type Props = {
  size?: number;
};

export const LoadingAnimation = ({ size }: Props) => (
  <Box
    sx={{
      display: "flex",
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <CircularProgress size={size} />
  </Box>
);
