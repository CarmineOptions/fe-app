import { Header } from "../Header/Header";
import { ReactNode } from "react";
import styles from "./layout.module.css";
import { Navigation } from "../Navigation";
import { Sidebar } from "../Sidebar";

type Props = {
  children: ReactNode;
};

export const Layout = ({ children }: Props) => {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <Sidebar />
        <Navigation />
        <main>{children}</main>
      </div>
    </>
  );
};
