import { AccountInterface } from "starknet";
import { afterTransaction } from "../utils/blockchain";
import { GOVERNANCE_ADDRESS } from "../constants/amm";

export const claim = async (
  account: AccountInterface,
  data: string[],
  setText: (txt: string) => void
) => {
  const contractAddress = GOVERNANCE_ADDRESS;
  const [address, amount, ...proof] = data;

  // calldata structure explained here: https://github.com/CarmineOptions/carmine-api/tree/master/carmine-api-airdrop
  // in Cairo, to send array you need to insert the length of array before the array items - "String(proof.length)"
  const calldata = [address, amount, String(proof.length), ...proof];
  const call = {
    contractAddress,
    entrypoint: "claim",
    calldata,
  };
  const res = await account.execute(call).catch(() => null);

  if (res === null) {
    setText("Transaction was rejected");
    return;
  }

  if (res && res.transaction_hash) {
    setText("Transaction is being processed, please be patient...");
    afterTransaction(
      res.transaction_hash,
      () => setText("Airdrop successfully sent to your wallet!"),
      () => setText("Transaction failed")
    );
  } else {
    setText(
      "Something went wrong, please get in touch in the Support chanell on our Discord"
    );
  }
};
