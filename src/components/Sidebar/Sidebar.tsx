import { MouseEvent, useEffect, useState } from "react";

import styles from "./sidebar.module.css";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { closeSidebar } from "../../redux/actions";

export const Sidebar = () => {
  const { sidebarOpen, sidebarContent } = useSelector((s: RootState) => s.ui);
  const [show, setShow] = useState(false);

  const effect = show ? `${styles.effect} ${styles.show}` : styles.effect;

  useEffect(() => {
    if (sidebarOpen) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [sidebarOpen]);

  const handleSidebarClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const className = `absolute top-0 h-full w-[360px] z-10 border-dark-tertiary border-l-[1px] bg-dark-container transition duration-500 ease-in-out ${
    sidebarOpen ? "right-0" : "right-[-360px]"
  }`;

  return (
    <>
      <div className={className} onClick={handleSidebarClick}>
        {sidebarContent}
      </div>
      {sidebarOpen && (
        <div className={styles.overlay} onClick={closeSidebar}></div>
      )}
      {sidebarOpen && <div className={effect} onClick={closeSidebar}></div>}
    </>
  );
};
