#!/bin/bash

rm -rf actual
mkdir -p actual

while read -r path
do
  name_with_extension=$(basename "$path")
  name="${name_with_extension%.*}"
  node ./run.mjs < "test-sources/$name.tas" > "actual/$name.txt"
  node ./compile.mjs < "test-sources/$name.tas" > "actual/$name.asm.txt"
done <<< "$(ls test-sources/*.tas)"
