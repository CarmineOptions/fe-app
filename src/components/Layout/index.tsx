import { Header } from "../Header/Header";
import { ReactNode } from "react";
import { Navigation } from "../Navigation";
import { Sidebar } from "../Sidebar";

type Props = {
  children: ReactNode;
};

export const Layout = ({ children }: Props) => {
  return (
    <>
      <Header />
      <div className="flex relative">
        <Sidebar />
        <Navigation />
        <main className="relative w-[calc(100%-202px)] min-h-[calc(100vh-62px)] pt-[80px] px-[7.5vw] bg-dark">
          {children}
        </main>
      </div>
    </>
  );
};
