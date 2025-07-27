#!/bin/sh

mkdir -p actual

ls test-sources/*.tas | while read -r path
do
  name_with_extension=$(basename "$path")
  name="${name_with_extension%.*}"
  echo "Generate $name"
  node --enable-source-maps ./tal-parse-to-json.mjs < "test-sources/$name.tas" > "actual/$name.json" &
  node --enable-source-maps ./tal-format.mjs < "test-sources/$name.tas" > "actual/$name.tas" &
  node --enable-source-maps ./tal-walk-to-xml.mjs < "test-sources/$name.tas" > "actual/$name.xml" &
  node --enable-source-maps ./tal-compile-to-asm.mjs < "test-sources/$name.tas" > "actual/$name.asm" &
  node --enable-source-maps ./tal-typecheck.mjs < "test-sources/$name.tas" > "actual/$name.txt" &
  wait $(jobs -rp)
done
