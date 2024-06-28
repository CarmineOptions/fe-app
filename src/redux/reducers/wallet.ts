import { createSlice } from "@reduxjs/toolkit";
import { WalletState } from "../../types/network";

const getInitialWalletState = (): WalletState => {
  return {
    address: undefined,
    balance: undefined,
  };
};

export const wallet = createSlice({
  name: "wallet",
  initialState: getInitialWalletState(),
  reducers: {
    updateWalletState: (state, action: { payload: Partial<WalletState> }) => {
      state = { ...state, ...action.payload };
      return state;
    },
  },
});

export const { updateWalletState } = wallet.actions;
