import { Proposal } from "../../types/proposal";

// export const fetchProposal = async ({
//     queryKey,
// }: QueryFunctionContext<[string, string | undefined]>): Promise<
//     OptionWithPosition[]
// > => {
//     const address = queryKey[1];
//     if (!address) {
//         throw Error("No address");
//     }

//     try {
//         const rawData = await getOptionsWithPositionOfUser(address);

//         const options = parseBatchOfOptions(rawData, 9, parseOptionWithPosition);

//         if (!isNonEmptyArray(options)) {
//             return [];
//         }

//         // remove position with size 0 (BE rounding error)
//         const filtered = options
//             .filter(({ parsed }) => !!parsed.positionSize)
//             .sort((a, b) => a.parsed.maturity - b.parsed.maturity);

//         debug("Fetched options with position", filtered);
//         return filtered;
//     } catch (e: unknown) {
//         debug("Failed to parse positions", e);
//         throw Error(typeof e === "string" ? e : "Failed to parse positions");
//     }
// };
export const activeProposal: Proposal[] = [
    { id: 55, discordLink: "https://discord.com/channels/xxx/yyy" },
    { id: 56, discordLink: "https://discord.com/channels/xxx/zzz" },
  ];
    // fetch("http://localhost:3001/positions")
    //     .then((res) => res.json())
    //     .then((res) => {
    //         if (res?.status !== "success" || !res?.data?.length) {
    //             return [];
    //         }
    //         const options = parseBatchOfOptions(
    //             res.data.map((v: string) => new BN(v)),
    //             9,
    //             parseOptionWithPosition
    //         );

    //         return activeProposals;
    //     });
