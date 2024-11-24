import { createSlice } from "@reduxjs/toolkit";
import { NetworkState } from "../../types/network";
import { provider, networkObject } from "../../network/provider";

const getInitialNetworkState = (): NetworkState => {
  return {
    walletId: undefined,
    provider,
    network: networkObject,
  };
};

export const network = createSlice({
  name: "network",
  initialState: getInitialNetworkState(),
  reducers: {
    updateNetworkState: (state, action: { payload: Partial<NetworkState> }) => {
      state = { ...state, ...action.payload };
      return state;
    },
  },
});

export const { updateNetworkState } = network.actions;
