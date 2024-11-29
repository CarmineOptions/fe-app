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
      <div className="flex relative min-h-[calc(100dvh-57px)]">
        <Sidebar />
        <Navigation />
        <main className="relative w-dvw md:w-[calc(100%-202px)] pt-5 md:pt-20 px-[7.5vw] xl:max-w-big xl:px-0 xl:mx-auto mb-20 bg-dark">
          {children}
        </main>
      </div>
    </>
  );
};
