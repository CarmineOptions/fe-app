import { useEffect, useState } from "react";
import { AMMContract } from "../utils/blockchain";
import { getOptionsWithPositionOfUser } from "../calls/getOptionsWithPosition";
import { RPCNode, rpcNodeCall } from "../calls/rpcNodeCall";
import { Box, Typography } from "@mui/material";
import { Layout } from "../components/Layout";

const selector =
  "0x2b20b26ede4304b68503c401a342731579b75844e5696ee13e6286cd51a9621";
const NUM_RUNS = 1;

const sleep = (sec: number) =>
  new Promise((resolve) => setTimeout(resolve, sec * 1000));

const benchFn = async (cb: () => Promise<any>) => {
  const d = Date.now();
  await cb();
  return (Date.now() - d) / 1000;
};

const average = (array: number[]) =>
  array.reduce((a, b) => a + b) / array.length;

const runBenchmark = async (fn: () => Promise<any>): Promise<string> => {
  const arr = [];
  for (let i = 0; i < NUM_RUNS; i++) {
    const res = await benchFn(fn);
    arr.push(res);
    // sleep in between requests to avoid rate limit
    await sleep(2);
  }
  // prevent interference with next benchmark
  await sleep(5);

  return report(arr);
};

const report = (arr: number[]): string =>
  `average: ${average(arr).toFixed(2)}s\nmax: ${Math.max(...arr).toFixed(
    2
  )}s\nmin: ${Math.min(...arr).toFixed(2)}s`;

type BenchSummary = { name: string; report: string };

export const bench = async (setData: (v: BenchSummary[]) => void) => {
  const address =
    "0x03d1525605db970fa1724693404f5f64cba8af82ec4aab514e6ebd3dec4838ad";

  const infuraFn = async () =>
    await rpcNodeCall(RPCNode.Infura, AMMContract.address, selector, [address]);
  const blastApiFn = async () =>
    await rpcNodeCall(RPCNode.BlastAPI, AMMContract.address, selector, [
      address,
    ]);
  const starknetFn = async () => await getOptionsWithPositionOfUser(address);

  const infura = await runBenchmark(infuraFn);
  const blast = await runBenchmark(blastApiFn);
  const starknet = await runBenchmark(starknetFn);

  const res = [
    { name: "Infura", report: infura },
    { name: "BlastAPI", report: blast },
    { name: "Starknet Blockchain", report: starknet },
  ];

  setData(res);
};

const BenchPage = () => {
  const [data, setData] = useState<BenchSummary[]>([]);
  useEffect(() => {
    bench(setData);
  }, []);

  return (
    <Layout>
      <Typography sx={{ mb: 2 }} variant="h4">
        Benchmark
      </Typography>
      {data.length === 0 && (
        <Typography>Wait for the test to finish</Typography>
      )}
      {data.length > 0 &&
        data.map((summary: BenchSummary, key: number) => (
          <Box key={key}>
            <Typography sx={{ mt: 2 }} variant="h6">
              {summary.name}
            </Typography>
            <Typography>{summary.report}</Typography>
          </Box>
        ))}
    </Layout>
  );
};

export default BenchPage;
