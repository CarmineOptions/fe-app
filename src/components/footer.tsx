import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Container from "@mui/material/Container";
import { Socials } from "./Socials";

const Copyright = () => (
  <Typography variant="body2" color="text.secondary" align="center">
    {"Copyright © "}
    <Link color="inherit" href="https://carmine.finance">
      Carmine Finance
    </Link>{" "}
    {new Date().getFullYear()}
    {"."}
  </Typography>
);

export const Footer = () => (
  <>
    <Container
      maxWidth="md"
      component="footer"
      sx={{
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        mt: 13,
        py: [3, 6],
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      <Copyright />
      <Socials />
    </Container>
  </>
);
