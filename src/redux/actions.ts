import { setSlippageState, updateSettingsState } from "./reducers/settings";
import { updateNetworkState } from "./reducers/network";
import {
  addReferredPairState,
  DialogContentElem,
  GovernanceSubpage,
  PortfolioParamType,
  ReferralSent,
  setCloseOptionState,
  setGovernanceSubpageState,
  setIsMobileState,
  setParamState,
  setShowNavigationState,
  setSidebarContentState,
  setSidebarOpenState,
  setSidebarWidthState,
  setTransferDataModalState,
  setTransferDialogShown,
  SidebarWidth,
  toggleDialog,
} from "./reducers/ui";
import { store } from "./store";
import { Settings } from "../types/settings";
import { NetworkState } from "../types/network";
import { OptionWithPosition } from "../classes/Option";
import { TransferData } from "../components/Transfer/transfer";
import {
  addTxReducer,
  setTxStatusReducer,
  Transaction,
  TransactionAction,
  TransactionStatus,
} from "./reducers/transactions";
import { ReactNode } from "react";

export const updateSettings = (v: Partial<Settings>) =>
  store.dispatch(updateSettingsState(v));

export const updateNetwork = (v: Partial<NetworkState>) =>
  store.dispatch(updateNetworkState(v));

export const closeDialog = () =>
  store.dispatch(
    toggleDialog({
      dialogOpen: false,
    })
  );

const openDialogWithContent = (content: DialogContentElem) =>
  store.dispatch(
    toggleDialog({
      dialogOpen: true,
      dialogContent: content,
    })
  );

export const openNetworkMismatchDialog = () =>
  openDialogWithContent(DialogContentElem.NetworkMismatch);

// deprecated
export const _openWalletConnectDialog = () =>
  openDialogWithContent(DialogContentElem.Wallet);

export const openSlippageDialog = () =>
  openDialogWithContent(DialogContentElem.Slippage);

export const openCloseOptionDialog = () =>
  openDialogWithContent(DialogContentElem.CloseOption);

export const openAccountDialog = () =>
  openDialogWithContent(DialogContentElem.Account);

export const openMetamaskMissingDialog = () =>
  openDialogWithContent(DialogContentElem.MetamaskMissing);

export const openNotEnoughUnlockedCapitalDialog = () =>
  openDialogWithContent(DialogContentElem.NotEnoughUnlocked);

export const openBraavosBonusDialog = () =>
  openDialogWithContent(DialogContentElem.BraavosBonusModal);

export const setSlippage = (n: number) => store.dispatch(setSlippageState(n));

export const setCloseOption = (option: OptionWithPosition) =>
  store.dispatch(setCloseOptionState(option));

export const setPortfolioParam = (option: PortfolioParamType) =>
  store.dispatch(setParamState(option));

export const openTransferModal = (data: TransferData) =>
  store.dispatch(setTransferDataModalState(data));

export const transferDialogShown = () =>
  store.dispatch(setTransferDialogShown(true));

export const transferDialogEnable = () =>
  store.dispatch(setTransferDialogShown(false));

export const addTx = (hash: string, id: string, action: TransactionAction) => {
  const tx: Transaction = {
    id,
    hash,
    action,
    status: TransactionStatus.Pending,
    timestamp: new Date().getTime(),
    chainId: store.getState().network.network.chainId,
  };
  store.dispatch(addTxReducer(tx));
};

export const markTxAsDone = (hash: string) =>
  store.dispatch(
    setTxStatusReducer({ hash, status: TransactionStatus.Success })
  );

export const markTxAsFailed = (hash: string) =>
  store.dispatch(
    setTxStatusReducer({ hash, status: TransactionStatus.Failed })
  );

export const addReferredPair = (pair: ReferralSent) =>
  store.dispatch(addReferredPairState(pair));

export const setGovernanceSubpage = (subpage: GovernanceSubpage) =>
  store.dispatch(setGovernanceSubpageState(subpage));

export const openSidebar = () => {
  store.dispatch(setSidebarOpenState(true));
  window.scrollTo({ top: 0, behavior: "smooth" });
};

export const closeSidebar = () => store.dispatch(setSidebarOpenState(false));

export const setSidebarContent = (node: ReactNode | null) =>
  store.dispatch(setSidebarContentState(node));

export const setSidebarWidth = (width: SidebarWidth) =>
  store.dispatch(setSidebarWidthState(width));

export const setIsMobile = (isMobile: boolean) =>
  store.dispatch(setIsMobileState(isMobile));

export const setShowNavigation = (show: boolean) =>
  store.dispatch(setShowNavigationState(show));
