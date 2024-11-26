import { L2 } from "../common";
import Starknet from "./starknet-tiny.svg?react";

export const DefispringBadge = () => (
  <div className="rounded-sm p-1 flex items-center w-fit bg-misc-starknet">
    <Starknet />
    <L2 className="text-dark font-bold">DEFI SPRING</L2>
  </div>
);
