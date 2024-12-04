import { memo, MouseEvent, ReactNode } from "react";
import { useSelector } from "react-redux";

import styles from "./sidebar.module.css";
import { RootState } from "../../redux/store";
import { closeSidebar } from "../../redux/actions";
import { SidebarWidth } from "../../redux/reducers/ui";

export const Sidebar = () => {
  const { sidebarOpen, sidebarContent, sidebarWidth } = useSelector(
    (s: RootState) => s.ui
  );

  return (
    <SidebarView
      sidebarOpen={sidebarOpen}
      sidebarContent={sidebarContent}
      sidebarWidth={sidebarWidth}
    />
  );
};

type SidebarViewProps = {
  sidebarOpen: boolean;
  sidebarContent: ReactNode;
  sidebarWidth: SidebarWidth;
};

export const SidebarView = memo(
  ({ sidebarOpen, sidebarContent, sidebarWidth }: SidebarViewProps) => {
    const effect = sidebarOpen
      ? `${styles.effect} ${styles.show}`
      : styles.effect;

    const handleSidebarClick = (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
    };

    const width =
      sidebarWidth === SidebarWidth.PriceProtect
        ? "w-sidebar lg:w-priceprotect"
        : "w-sidebar";

    return (
      <>
        <div
          className={`border-brand-deep border-l-[1px] box-border absolute top-0 overflow-hidden h-full z-40 bg-dark-container transition-all duration-1500 ease-in-out ${
            sidebarOpen
              ? `block right-0 ${width}`
              : "w-sidebar right-[-360px] invisible"
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
  }
);
