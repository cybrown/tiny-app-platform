#!/bin/sh

set -ex

CUR_DIR=$(pwd)

npm i
npm run build

cp -r packages/web-client/dist/* packages/electron-client
mkdir -p packages/electron-client/back/lib
cp -r packages/backend/lib packages/backend/*.json packages/electron-client/back

cd packages/electron-client || exit 1

cd back || exit 1
npm i
../node_modules/.bin/electron-rebuild
cd .. || exit 1

rm -rf node_modules
npm i
./node_modules/.bin/electron-rebuild

npm run make

cd "$CUR_DIR" || exit 1
