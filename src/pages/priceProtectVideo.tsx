const PriceProtectVideoPage = () => {
  const defaultWidth = 987;
  const defaultHeight = 555;
  const width = Math.min(window.innerWidth, defaultWidth);
  const height = Math.min(window.innerHeight, defaultHeight);

  return (
    <iframe
      src="https://drive.google.com/file/d/1M7ROxzZ-d9XhePYe-15j0T--UGdoiYPi/preview"
      style={{
        border: "none",
      }}
      width={width}
      height={height}
      allow="autoplay"
      title="CarmineOptions Price Protect"
    />
  );
};

export default PriceProtectVideoPage;
