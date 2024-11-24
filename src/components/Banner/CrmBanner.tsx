import { useNavigate } from "react-router-dom";
import styles from "./banner.module.css";
import bannerImg from "./crm-banner.png";

export const CrmBanner = () => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/governance/airdrop")}
      className={styles.crmbanner}
      style={{
        backgroundImage: `url(${bannerImg})`,
        backgroundSize: "contain",
      }}
    ></div>
  );
};
