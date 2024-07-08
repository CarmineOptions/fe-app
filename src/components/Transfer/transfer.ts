import { AMM_ADDRESS, ETH_ADDRESS, USDC_ADDRESS } from "../../constants/amm";
import {
  AccountInterface,
  Contract,
  InvokeFunctionResponse,
  Uint256,
  uint256,
} from "starknet";
import { AMM_METHODS, LEGACY_AMM } from "../../constants/amm";
import { provider } from "../../network/provider";

// ABIs
import LegacyAmmAbi from "../../abi/legacy_amm_abi.json";
import ERC20Abi from "../../abi/lptoken_abi.json";
import NewAmmAbi from "../../abi/amm_abi.json";
import { afterTransaction } from "../../utils/blockchain";

type LegacyPoolInfo = {
  pool_info: { lptoken_address: bigint };
  size_of_users_tokens: Uint256;
  value_of_user_stake: Uint256;
};

type LegacyRes = {
  user_pool_infos: LegacyPoolInfo[];
};

type UserPoolBalance = {
  size: bigint;
  value: bigint;
};

export type TransferData = {
  call?: UserPoolBalance;
  put?: UserPoolBalance;
  shouldTransfer: boolean;
};

const LegacyAmmContract = new Contract(LegacyAmmAbi, LEGACY_AMM, provider);

const poolInfoToBalance = (poolInfo: LegacyPoolInfo): UserPoolBalance => ({
  size: uint256.uint256ToBN(poolInfo.size_of_users_tokens),
  value: uint256.uint256ToBN(poolInfo.value_of_user_stake),
});

export const userLpBalance = async (
  userAddress: string
): Promise<TransferData> => {
  const res = (await LegacyAmmContract.call(AMM_METHODS.GET_USER_POOL_INFOS, [
    userAddress,
  ]).catch((e: string) => {
    throw Error("Failed getting legacy AMM LP balance");
  })) as LegacyRes;

  const callPool = res.user_pool_infos.find(
    (pool) =>
      pool.pool_info.lptoken_address ===
      3469460003801871795152105437415806585572109878441026132241656724706745946148n
  );
  const putPool = res.user_pool_infos.find(
    (pool) =>
      pool.pool_info.lptoken_address ===
      696874414332508171340203326495048792590195984046077186690868714040272913018n
  );

  const call = callPool && poolInfoToBalance(callPool);
  const put = putPool && poolInfoToBalance(putPool);
  const shouldTransfer = !!(
    (call && call.value > 0n) ||
    (put && put.value > 0n)
  );

  const transferData: TransferData = { shouldTransfer, call, put };

  return transferData;
};

export enum TransferState {
  Processing,
  Success,
  Fail,
  Initial,
}

export const transferLpCapital = async (
  account: AccountInterface,
  data: TransferData,
  setState: (state: TransferState) => void
) => {
  setState(TransferState.Processing);
  const actions = [];
  const abis = [];

  // WITHDRAW FROM POOLS

  if (data.call?.size) {
    actions.push({
      contractAddress: LEGACY_AMM,
      entrypoint: AMM_METHODS.WITHDRAW_LIQUIDITY,
      calldata: [
        ETH_ADDRESS,
        USDC_ADDRESS,
        ETH_ADDRESS,
        0, // type Call
        data.call.size.toString(10),
        0, // uint256 0
      ],
    });
    abis.push(LegacyAmmAbi);
  }
  if (data.put?.size) {
    actions.push({
      contractAddress: LEGACY_AMM,
      entrypoint: AMM_METHODS.WITHDRAW_LIQUIDITY,
      calldata: [
        USDC_ADDRESS,
        USDC_ADDRESS,
        ETH_ADDRESS,
        1, // type Put
        data.put.size.toString(10),
        0, // uint256 0
      ],
    });
    abis.push(LegacyAmmAbi);
  }

  // APPROVE WITHDRAWN

  if (data.call?.size) {
    actions.push({
      contractAddress: ETH_ADDRESS,
      entrypoint: AMM_METHODS.APPROVE,
      calldata: [AMM_ADDRESS, data.call.value.toString(10), "0"],
    });
    abis.push(ERC20Abi);
  }
  if (data.put?.size) {
    actions.push({
      contractAddress: USDC_ADDRESS,
      entrypoint: AMM_METHODS.APPROVE,
      calldata: [AMM_ADDRESS, data.put.value.toString(10), "0"],
    });
    abis.push(ERC20Abi);
  }

  // STAKE WITHDRAWN

  if (data.call?.size) {
    actions.push({
      contractAddress: AMM_ADDRESS,
      entrypoint: AMM_METHODS.DEPOSIT_LIQUIDITY,
      calldata: [
        ETH_ADDRESS,
        USDC_ADDRESS,
        ETH_ADDRESS,
        0, // type Call
        data.call.value.toString(10),
        0, // uint256 0
      ],
    });
    abis.push(NewAmmAbi);
  }
  if (data.put?.size) {
    actions.push({
      contractAddress: AMM_ADDRESS,
      entrypoint: AMM_METHODS.DEPOSIT_LIQUIDITY,
      calldata: [
        USDC_ADDRESS,
        USDC_ADDRESS,
        ETH_ADDRESS,
        1, // type Put
        data.put.value.toString(10),
        0, // uint256 0
      ],
    });
    abis.push(NewAmmAbi);
  }

  const res = await account.execute(actions, abis).catch((e) => {
    setState(TransferState.Fail);
  });

  if (res && (res as InvokeFunctionResponse).transaction_hash) {
    const tx = (res as InvokeFunctionResponse).transaction_hash;
    afterTransaction(
      tx,
      () => {
        // everything done - OK callback
        setState(TransferState.Success);
      },
      () => {
        setState(TransferState.Fail);
      }
    );
  }
};
