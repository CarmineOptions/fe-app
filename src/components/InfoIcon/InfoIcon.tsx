import { Info } from "@mui/icons-material";
import { Tooltip } from "@mui/material";

export const InfoIcon = ({ text, size }: { text: string; size?: string }) => (
  <Tooltip title={text}>
    <Info sx={{ width: size, height: size }} />
  </Tooltip>
);
