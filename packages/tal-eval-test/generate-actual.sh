#!/bin/sh

rm -rf actual
mkdir -p actual

ls test-sources/*.tas | while read -r path
do
  name_with_extension=$(basename "$path")
  name="${name_with_extension%.*}"
  node ./index.mjs < "test-sources/$name.tas" > "actual/$name.async.txt"
  node ./index.mjs --force-sync < "test-sources/$name.tas" > "actual/$name.sync.txt"
  node ./compile.mjs < "test-sources/$name.tas" > "actual/$name.ir.txt"
done
