export type PopupConfig = {
  url: string;
  width?: number;
  height?: number;
  left?: number;
  top?: number;
};

export const openPopupWindow = (config: PopupConfig) => {
  if (!window) {
    return;
  }

  const { url, width, height, left, top } = {
    width: 987,
    height: 555,
    left: 0,
    top: 0,
    ...config,
  };

  window.open(
    url,
    "popupWindow", // Window name
    `width=${width},height=${height},top=${top},left=${left},resizable,scrollbars`
  );
};
