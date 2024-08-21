import { MouseEvent } from "react";

import styles from "./sidebar.module.css";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { closeSidebar } from "../../redux/actions";

export const Sidebar = () => {
  const { sidebarOpen, sidebarContent } = useSelector((s: RootState) => s.ui);

  const handleSidebarClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const className = sidebarOpen
    ? styles.sidebar
    : `${styles.sidebar} ${styles.closed}`;

  return (
    <>
      <div className={className} onClick={handleSidebarClick}>
        {sidebarContent}
      </div>
      {sidebarOpen && (
        <div className={styles.overlay} onClick={closeSidebar}></div>
      )}
    </>
  );
};
