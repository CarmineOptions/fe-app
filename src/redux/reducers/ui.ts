import { createSlice } from "@reduxjs/toolkit";

import { OptionWithPosition } from "../../classes/Option";
import { BuyPriceGuardModalData } from "../../components/PriceGuard/BuyPriceGuardModal";
import { TransferData } from "../../components/Transfer/transfer";

export enum DialogContentElem {
  Wallet = "Wallet",
  Account = "Account",
  NetworkMismatch = "NetworkMismatch",
  Slippage = "Slippage",
  CloseOption = "CloseOption",
  BuyPriceGuard = "BuyPriceGuard",
  MetamaskMissing = "MetamaskMissing",
  NotEnoughUnlocked = "NotEnoughUnlocked",
  TransferCapital = "TransferCapital",
  BraavosBonusModal = "BraavosBonusModal",
}

export enum ToastType {
  Warn = "warn",
  Info = "info",
  Success = "success",
  Error = "error",
}
export enum PortfolioParamType {
  AirDrop = "airdrop",
  History = "history",
  Position = "position",
  Referral = "referral",
}

export enum GovernanceSubpage {
  AirDrop = "airdrop",
  Voting = "voting",
  Staking = "staking",
}

export type ToastState = {
  message: string;
  open: boolean;
  type: ToastType;
};

export type ReferralSent = {
  code: string;
  address: string;
};

export interface UiState {
  dialogOpen: boolean;
  dialogContent: DialogContentElem;
  toastState: ToastState;
  activeCloseOption?: OptionWithPosition;
  buyPriceGuardModalData?: BuyPriceGuardModalData;
  transferData?: TransferData;
  transferDialogShown: boolean;
  portfolioParam?: PortfolioParamType;
  governanceSubpage: GovernanceSubpage;
  referralsSent: ReferralSent[];
}

export const ui = createSlice({
  name: "ui",
  initialState: {
    dialogOpen: false,
    dialogContent: DialogContentElem.Wallet,
    toastState: { message: "", type: ToastType.Info, open: false },
    transferDialogShown: false,
    portfolioParam: PortfolioParamType.Position,
    governanceSubpage: GovernanceSubpage.Voting,
    referralsSent: [],
  } as UiState,
  reducers: {
    toggleDialog: (state, action: { payload: Partial<UiState> }) => {
      state.dialogOpen = !!action.payload.dialogOpen;
      if (action.payload.dialogContent) {
        state.dialogContent = action.payload.dialogContent;
      }
      return state;
    },
    setCloseOptionState: (state, action: { payload: OptionWithPosition }) => {
      // @ts-ignore
      state.activeCloseOption = action.payload;
      return state;
    },
    setBuyPriceGuardModalState: (
      state,
      action: { payload: BuyPriceGuardModalData }
    ) => {
      state.buyPriceGuardModalData = action.payload;
      return state;
    },
    setToastState: (state, action: { payload: Partial<ToastState> }) => {
      state.toastState = { ...state.toastState, ...action.payload };
      return state;
    },
    setTransferDataModalState: (state, action: { payload: TransferData }) => {
      state.transferData = action.payload;
      state.dialogOpen = true;
      state.dialogContent = DialogContentElem.TransferCapital;
      return state;
    },
    setTransferDialogShown: (state, action: { payload: boolean }) => {
      state.transferDialogShown = action.payload;
      return state;
    },
    setParamState: (state, action: { payload: PortfolioParamType }) => {
      state.portfolioParam = action.payload;
      return state;
    },
    setGovernanceSubpageState: (
      state,
      action: { payload: GovernanceSubpage }
    ) => {
      state.governanceSubpage = action.payload;
      return state;
    },
    addReferredPairState: (state, action: { payload: ReferralSent }) => {
      state.referralsSent = [...state.referralsSent, action.payload];
      return state;
    },
  },
});

export const {
  toggleDialog,
  setBuyPriceGuardModalState,
  setCloseOptionState,
  setToastState,
  setTransferDataModalState,
  setTransferDialogShown,
  setParamState,
  setGovernanceSubpageState,
  addReferredPairState,
} = ui.actions;
