import { createSlice } from "@reduxjs/toolkit";
import { OptionWithPosition } from "../../classes/Option";
import { BuyInsuranceModalData } from "../../components/Insurance/BuyInsuranceModal";
import { TransferData } from "../../components/Transfer/transfer";

export enum DialogContentElem {
  Wallet = "Wallet",
  Account = "Account",
  NetworkMismatch = "NetworkMismatch",
  Slippage = "Slippage",
  CloseOption = "CloseOption",
  BuyInsurance = "BuyInsurance",
  MetamaskMissing = "MetamaskMissing",
  NotEnoughUnlocked = "NotEnoughUnlocked",
  TransferCapital = "TransferCapital",
}

export enum ToastType {
  Warn = "warn",
  Info = "info",
  Success = "success",
  Error = "error",
}

export type ToastState = {
  message: string;
  open: boolean;
  type: ToastType;
};

export interface UiState {
  dialogOpen: boolean;
  dialogContent: DialogContentElem;
  toastState: ToastState;
  activeCloseOption?: OptionWithPosition;
  buyInsuranceModalData?: BuyInsuranceModalData;
  transferData?: TransferData;
}

export const ui = createSlice({
  name: "ui",
  initialState: {
    dialogOpen: false,
    dialogContent: DialogContentElem.Wallet,
    toastState: { message: "", type: ToastType.Info, open: false },
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
      state.activeCloseOption = action.payload;
      return state;
    },
    setBuyInsuranceModalState: (
      state,
      action: { payload: BuyInsuranceModalData }
    ) => {
      state.buyInsuranceModalData = action.payload;
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
  },
});

export const {
  toggleDialog,
  setBuyInsuranceModalState,
  setCloseOptionState,
  setToastState,
  setTransferDataModalState,
} = ui.actions;
