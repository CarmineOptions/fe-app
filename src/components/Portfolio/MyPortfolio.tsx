import { useState } from "react";
import styles from "./portfolio.module.css";

export const MyPortfolio = () => {
  const [options, setOptions] = useState<"live" | "itm" | "otm">("live");

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        <div>
          <span>portfolio value</span>
          <span>$20.21</span>
        </div>
        <div>
          <span>options</span>
          <span>$10.18</span>
        </div>
        <div>
          <span>yield</span>
          <span>$9.81</span>
        </div>
      </div>
      <div className="divider"></div>
      <div>
        <div className={styles.options}>
          <h1>Options</h1>
          <div className={styles.buttons}>
            <button
              onClick={() => setOptions("live")}
              className={options === "live" ? "active primary" : ""}
            >
              live
            </button>
            <button
              onClick={() => setOptions("itm")}
              className={options === "itm" ? "active primary" : ""}
            >
              expired itm
            </button>
            <button
              onClick={() => setOptions("otm")}
              className={options === "otm" ? "active primary" : ""}
            >
              expired otm
            </button>
          </div>
        </div>
      </div>
      <div className="divider"></div>
      <div>
        <h1>Staking</h1>
      </div>
    </div>
  );
};
