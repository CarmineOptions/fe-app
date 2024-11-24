import { Layout } from "../components/Layout";
import styles from "./maintainance.module.css";

const Maintainance = () => {
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
