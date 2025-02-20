#!/bin/sh

mkdir -p actual

ls test-sources/*.tas | while read -r path
do
  name_with_extension=$(basename "$path")
  name="${name_with_extension%.*}"
  node ./tal-parse-to-json.mjs < "test-sources/$name.tas" > "actual/$name.json"
  node ./tal-format.mjs < "test-sources/$name.tas" > "actual/$name.tas"
  node ./tal-walk-to-xml.mjs < "test-sources/$name.tas" > "actual/$name.xml"
  node ./tal-compile-to-asm.mjs < "test-sources/$name.tas" > "actual/$name.asm"
done
