import { useEffect } from "react";
import { Layout } from "../components/layout";
import styles from "./maintainance.module.css";

const Maintainance = () => {
  useEffect(() => {
    document.title = "Maintainance | Carmine Finance";
  });

  return (
    <Layout>
      <div className={styles.container}>
        <h3>Page under maintainance</h3>
        <p>We apologise for the inconvenience</p>
      </div>
    </Layout>
  );
};

export default Maintainance;
