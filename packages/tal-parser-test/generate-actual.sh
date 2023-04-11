#!/bin/sh

mkdir -p actual

ls test-sources/*.tas | while read -r path
do
  name_with_extension=$(basename "$path")
  name="${name_with_extension%.*}"
  node ./tas2json.mjs < "test-sources/$name.tas" > "actual/$name.json"
  node ./format.mjs < "test-sources/$name.tas" > "actual/$name.tas"
done
