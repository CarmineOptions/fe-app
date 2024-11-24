#!/bin/bash

INDEX_FILE_PATH="public/index.html"
PLACEHOLDER="<!--GTAG_PLACEHOLDER-->"
TESTNET_GTAG="<script async src=\"https://www.googletagmanager.com/gtag/js?id=G-VS8PL3X8J6\"></script>\n<script>\n\twindow.dataLayer = window.dataLayer || [];\n\tfunction gtag() { dataLayer.push(arguments); }\n\tgtag('js', new Date());\n\tgtag('config', 'G-VS8PL3X8J6');\n</script>"
MAINNET_GTAG="<script async src=\"https://www.googletagmanager.com/gtag/js?id=G-1HMTDR9W32\"></script>\n<script>\n\twindow.dataLayer = window.dataLayer || [];\n\tfunction gtag() { dataLayer.push(arguments); }\n\tgtag('js', new Date());\n\tgtag('config', 'G-1HMTDR9W32');\n</script>"

# Check if a flag is provided
if [ $# -eq 0 ]; then
  echo "Please provide a flag (A or B)."
  exit 1
fi

# Check the flag and set the new string accordingly
if [ "$1" == "testnet" ]; then
  GTAG=$TESTNET_GTAG
elif [ "$1" == "mainnet" ]; then
  GTAG=$MAINNET_GTAG
else
  echo "Specify network, \"testnet\" or \"mainnet\"?"
  exit 1
fi

echo $TESTNET_GTAG
echo $MAINNET_GTAG
echo $GTAG

sed -i.bak "s#$PLACEHOLDER#$GTAG#g" $INDEX_FILE_PATH && rm "$INDEX_FILE_PATH.bak"

echo "Replaced Gtag placeholder with $1 Gtag"
