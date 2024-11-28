import { createSlice } from "@reduxjs/toolkit";

import { OptionWithPosition } from "../../classes/Option";
import { TransferData } from "../../components/Transfer/transfer";
import { ReactNode } from "react";

export enum SidebarWidth {
  Base = "sidebar",
  PriceProtect = "priceprotect",
}

export enum DialogContentElem {
  Wallet = "Wallet",
  Account = "Account",
  NetworkMismatch = "NetworkMismatch",
  Slippage = "Slippage",
  CloseOption = "CloseOption",
  MetamaskMissing = "MetamaskMissing",
  NotEnoughUnlocked = "NotEnoughUnlocked",
  TransferCapital = "TransferCapital",
  BraavosBonusModal = "BraavosBonusModal",
}

export enum PortfolioParamType {
  AirDrop = "airdrop",
  History = "history",
  MyPortfolio = "my-portfolio",
  Referral = "referral",
}

export enum GovernanceSubpage {
  AirDrop = "airdrop",
  Voting = "voting",
  Staking = "staking",
  Propose = "propose",
}

export type ReferralSent = {
  code: string;
  address: string;
};

export interface UiState {
  dialogOpen: boolean;
  dialogContent: DialogContentElem;
  activeCloseOption?: OptionWithPosition;
  transferData?: TransferData;
  transferDialogShown: boolean;
  portfolioParam?: PortfolioParamType;
  governanceSubpage: GovernanceSubpage;
  referralsSent: ReferralSent[];
  sidebarOpen: boolean;
  sidebarContent: ReactNode | null;
  sidebarWidth: SidebarWidth;
  isMobile: boolean;
  showNavigation: boolean;
}

export const ui = createSlice({
  name: "ui",
  initialState: {
    dialogOpen: false,
    dialogContent: DialogContentElem.Wallet,
    transferDialogShown: false,
    portfolioParam: PortfolioParamType.MyPortfolio,
    governanceSubpage: GovernanceSubpage.Voting,
    referralsSent: [],
    sidebarOpen: false,
    sidebarContent: null,
    sidebarWidth: SidebarWidth.Base,
    isMobile: window.innerWidth < 700,
    showNavigation: false,
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
      // @ts-expect-error setting option is not infinite
      state.activeCloseOption = action.payload;
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
    setSidebarOpenState: (state, action: { payload: boolean }) => {
      state.sidebarOpen = action.payload;
      return state;
    },
    setSidebarContentState: (state, action: { payload: ReactNode | null }) => {
      state.sidebarContent = action.payload;
      return state;
    },
    setSidebarWidthState: (state, action: { payload: SidebarWidth }) => {
      state.sidebarWidth = action.payload;
      return state;
    },
    setIsMobileState: (state, action: { payload: boolean }) => {
      state.isMobile = action.payload;
      return state;
    },
    setShowNavigationState: (state, action: { payload: boolean }) => {
      state.showNavigation = action.payload;
      return state;
    },
  },
});

export const {
  toggleDialog,
  setCloseOptionState,
  setTransferDataModalState,
  setTransferDialogShown,
  setParamState,
  setGovernanceSubpageState,
  addReferredPairState,
  setSidebarOpenState,
  setSidebarContentState,
  setSidebarWidthState,
  setIsMobileState,
  setShowNavigationState,
} = ui.actions;
