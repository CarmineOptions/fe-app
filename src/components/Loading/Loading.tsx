import { CircularProgress } from "@mui/material";

type Props = {
  size?: number;
};

export const LoadingAnimation = ({ size }: Props) => (
  <div className="flex w-full h-full justify-center items-center text-dark-primary">
    <CircularProgress size={size} color="inherit" />
  </div>
);
