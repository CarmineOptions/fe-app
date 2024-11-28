import { memo, MouseEvent } from "react";
import { useSelector } from "react-redux";

import styles from "./sidebar.module.css";
import { RootState } from "../../redux/store";
import { closeSidebar } from "../../redux/actions";

export const Sidebar = memo(() => {
  const { sidebarOpen, sidebarContent, sidebarWidth } = useSelector(
    (s: RootState) => s.ui
  );

  const effect = sidebarOpen
    ? `${styles.effect} ${styles.show}`
    : styles.effect;

  const handleSidebarClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <>
      <div
        className={`border-brand-deep border-l-[1px] w-${sidebarWidth} box-border absolute top-0 h-full z-40 bg-dark-container transition-all duration-1500 ease-in-out ${
          sidebarOpen ? "right-0" : "w-[360px] right-[-360px]"
        }`}
        onClick={handleSidebarClick}
      >
        {sidebarContent}
      </div>
      {sidebarOpen && (
        <div
          className="fixed top-0 right-0 left-0 bottom-0 bg-dark bg-opacity-60 z-30 h-full"
          onClick={closeSidebar}
        ></div>
      )}
      {sidebarOpen && <div className={effect} onClick={closeSidebar}></div>}
    </>
  );
});
