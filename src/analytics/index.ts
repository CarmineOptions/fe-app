export const sendGtagEvent = (event: string, params: object) => {
  if (!window.gtag) {
    return;
  }
  window.gtag("event", event, params);
};

declare global {
  interface Window {
    gtag?: (
      command: string,
      command_parameter: string,
      arguments: object
    ) => void;
  }
}
