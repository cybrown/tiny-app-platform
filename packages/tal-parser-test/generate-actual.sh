#!/bin/sh

mkdir -p actual

ls test-sources/*.tal | while read -r path
do
  name_with_extension=$(basename "$path")
  name="${name_with_extension%.*}"
  node ./tal2json.mjs < "test-sources/$name.tal" > "actual/$name.json"
  node ./format.mjs < "test-sources/$name.tal" > "actual/$name.tal"
done
