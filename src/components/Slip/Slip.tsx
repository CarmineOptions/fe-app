import { useEffect, useState } from "react";
import styles from "./Slip.module.css";
import { useNavigate } from "react-router-dom";

const MIN_WIDTH = 1200;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LegacyAppMessage = () => (
  <div className={styles.slip}>
    This App uses new Carmine Protocol with C2 contracts. Old App can be
    accessed at{" "}
    <a href="https://legacy.app.carmine.finance">legacy.app.carmine.finance</a>.
  </div>
);

const AirdropMessage = () => {
  const navigate = useNavigate();

  const handleClick = () => navigate("/governance/airdrop");

  return (
    <div className={styles.slip}>
      Carmine Airdrop is now available! Claim it{" "}
      <a style={{ cursor: "pointer" }} onClick={handleClick}>
        here
      </a>
      .
    </div>
  );
};

export const Slip = () => {
  const [isWideScreen, setIsWideScreen] = useState(
    window.innerWidth > MIN_WIDTH
  );

  useEffect(() => {
    function handleResize() {
      setIsWideScreen(window.innerWidth > MIN_WIDTH);
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (isWideScreen) {
    return <AirdropMessage />;
  }

  return (
    <div className={styles["scroll-container"]}>
      <div className={styles.scroller}>
        <AirdropMessage />
        <AirdropMessage />
      </div>
    </div>
  );
};
