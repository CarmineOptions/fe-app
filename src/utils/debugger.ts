export enum LogTypes {
  WARN = "warn",
  LOG = "log",
  ERROR = "error",
}

const shouldLog =
  window.location.hostname === "localhost" ||
  window.location.search.includes("debug=1");

export const debug = (...args: any) => {
  if (!shouldLog) {
    return;
  }

  let type = LogTypes.LOG;

  const style = `display: inline-block; color: white; background: #D70040; padding: 1px 4px; border-radius: 3px;`;
  const displayName = "%ccarmine";

  if (Object.values(LogTypes).includes(args[0])) {
    type = args[0];
    args.shift();
  }
  console[type](displayName, style, ...args);
};
