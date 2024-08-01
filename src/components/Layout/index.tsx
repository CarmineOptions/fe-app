import { Header } from "../Header/Header";
import { ReactNode } from "react";
import styles from "./layout.module.css";
import { Navigation } from "../Navigation";

type Props = {
  children: ReactNode;
};

export const Layout = ({ children }: Props) => (
  <>
    <Header />
    <div className={styles.container}>
      <Navigation />
      <main>{children}</main>
    </div>
  </>
);
