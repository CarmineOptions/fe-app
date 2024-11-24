import { Box, Link, useTheme } from "@mui/material";

type IconProps = { to: string; src: string; alt: string; padding?: number };

const Icon = ({ to, src, alt, padding }: IconProps) => (
  <Link href={to}>
    <img
      src={src}
      alt={alt}
      style={{ width: "40px", padding: `${padding ? padding : 8}px` }}
    />
  </Link>
);

const style = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const socialList = [
  {
    to: "https://docs.carmine.finance/carmine-options-amm/",
    src: "file-alt",
    alt: "documentation logo",
    padding: 10,
  },
  {
    to: "https://discord.gg/uRs7j8w3bX",
    src: "discord",
    alt: "discord logo",
  },
  {
    to: "https://github.com/CarmineOptions",
    src: "github",
    alt: "github logo",
  },
  {
    to: "https://twitter.com/CarmineOptions",
    src: "twitter",
    alt: "twitter logo",
    padding: 7,
  },
];

export const Socials = () => {
  const theme = useTheme();

  const finalSrc = (s: string) =>
    `${s}${theme.palette.mode === "light" ? "-black" : ""}.svg`;

  return (
    <Box sx={style}>
      {socialList.map(({ to, src, alt, padding }, i) => (
        <Icon
          to={to}
          // if ligh mode use black icons
          src={finalSrc(src)}
          alt={alt}
          padding={padding}
          key={i}
        />
      ))}
    </Box>
  );
};
