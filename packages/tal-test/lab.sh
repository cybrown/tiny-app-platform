#!/bin/sh

# Dummy script to run a command with a specific input file.
# This is useful for testing purposes.

for index in $(seq 2 2 | xargs -n 1 printf "%03d ");
do
  #FILE="test-sources/narrowing_$index.tas"
  FILE="test-sources/type_narrowing_$index.tas"
  echo $FILE
  node --enable-source-maps ./tal-lower.mjs < $FILE
  #node --enable-source-maps ./tal-typecheck.mjs < $FILE
  #node --enable-source-maps ./tal-compile-to-asm.mjs < $FILE
done
