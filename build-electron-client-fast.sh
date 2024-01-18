#!/bin/sh

echo "WARNING: Build all libs, web-client and backend before using this script !"

set -ex

CUR_DIR=$(pwd)

cp -r packages/web-client/build/* packages/electron-client
mkdir -p packages/electron-client/back/lib
cp -r packages/backend/lib packages/backend/*.json packages/electron-client/back

cd packages/electron-client || exit 1

cd back || exit 1
npm i
cd .. || exit 1

npm run package

cd "$CUR_DIR" || exit 1
