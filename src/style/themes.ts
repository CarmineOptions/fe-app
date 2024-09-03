import { ThemeOptions, createTheme } from "@mui/material";

declare module "@mui/material/styles" {
  interface Palette {
    border: Palette["primary"];
  }

  interface PaletteOptions {
    border?: PaletteOptions["primary"];
  }
}

const themeConfig: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#ffb000",
    },
    secondary: {
      main: "#ffb300",
    },
    background: {
      default: "#000000",
      paper: "#000000",
    },
    success: {
      main: "#1AFF00",
    },
    divider: "#a9aaac",
  },
  typography: {
    fontSize: 15,
    fontWeightRegular: 500,
    fontFamily: ['"IBM Plex Sans Condensed"', "sans-serif"].join(","),
  },
};

export const theme = createTheme(themeConfig);
