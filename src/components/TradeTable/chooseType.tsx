import { apiUrl } from "../../api";
import { OptionType } from "../../types/options";
import { debug } from "../../utils/debugger";

const TIMEOUT = 1000; // abort after 1,5s
const ETH_PRICE_APPROXIMATION = 1600n; // approximation of ETH price

const flipCoin = (): OptionType =>
  Math.random() > 0.5 ? OptionType.Call : OptionType.Put;

type StatusData = {
  // only field we care about
  unlocked_cap: string;
};

type StatusResponse = {
  status: string;
  data: StatusData;
};

export const chooseType = async (): Promise<OptionType> => {
  const callPromise = fetch(apiUrl("eth-usdc-call/state"), {
    signal: AbortSignal.timeout(TIMEOUT),
  }).then((res) => res.json());
  const putPromise = fetch(apiUrl("eth-usdc-put/state"), {
    signal: AbortSignal.timeout(TIMEOUT),
  }).then((res) => res.json());

  const [callResult, putResult] = await Promise.allSettled([
    callPromise,
    putPromise,
  ]);

  if (callResult.status === "rejected" || putResult.status === "rejected") {
    // did not fetch in time - flip a coin
    debug("choosing type - rejected fliping a coin");
    return flipCoin();
  }

  const [call, put] = [
    (callResult as PromiseFulfilledResult<StatusResponse>).value,
    (putResult as PromiseFulfilledResult<StatusResponse>).value,
  ];

  if (call.status !== "success" || put.status !== "success") {
    // unexpected response - flip a coin
    return flipCoin();
  }

  const callUnlocked = BigInt(call.data.unlocked_cap) * ETH_PRICE_APPROXIMATION;
  const putUnlocked = BigInt(put.data.unlocked_cap) * 10n ** 12n; // 18 - 6 difference between ETH USDC digits

  debug({
    callUnlocked: callUnlocked.toString(10),
    putUnlocked: putUnlocked.toString(10),
  });

  const chosenType =
    callUnlocked > putUnlocked
      ? // more unlocked in the call pool than put pool
        OptionType.Call
      : // more unlocked in the put pool than call pool
        OptionType.Put;

  debug("type decided based on unlocked capital:", {
    call: call.data,
    put: put.data,
    chosenType,
  });
  return chosenType;
};
