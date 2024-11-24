export const parseBatchOfOptions = <T, R>(
  arr: T[],
  batchSize: number,
  parsingFunction: (v: T[]) => R
): R[] => {
  const l = arr.length;

  if (l === 0) {
    return [];
  }

  if (l % batchSize !== 0) {
    throw Error("Failed to parse batch, sizes mismatch" + JSON.stringify(arr));
  }

  const options = [];

  for (let i = 0; i < l / batchSize; i++) {
    const cur = arr.slice(i * batchSize, (i + 1) * batchSize);
    try {
      options.push(parsingFunction(cur));
    } catch (error) {
      console.warn(`Failed to parse batch, parsing fnc threw: ${error}`);
    }
  }

  return options;
};
