#!/bin/sh

rm -rf actual
mkdir -p actual

ls test-sources/*.tal | while read -r path
do
  name_with_extension=$(basename "$path")
  name="${name_with_extension%.*}"
  node ./index.mjs < "test-sources/$name.tal" > "actual/$name.async.txt"
  node ./index.mjs --force-sync < "test-sources/$name.tal" > "actual/$name.sync.txt"
done
