import { Menu } from "@mui/material";
import ThreeDots from "./icons/three-dots.svg?react";
import { useState } from "react";
import { MenuContent } from "./MenuContent";

export const LinksMenu = () => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => setOpen(!open);
  const handleClose = () => setOpen(false);

  return (
    <div
      id="links-menu"
      style={{
        display: "flex",
        marginLeft: "1em",
        marginRight: "1em",
        cursor: "pointer",
      }}
      onClick={toggleOpen}
    >
      <ThreeDots />
      <Menu
        anchorEl={document.getElementById("links-menu")}
        id="links-list-menu"
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuContent handleClose={handleClose} />
      </Menu>
    </div>
  );
};
