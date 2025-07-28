#!/bin/sh

# Dummy script to run a command with a specific input file.
# This is useful for testing purposes.

for index in $(seq 15 15 | xargs -n 1 printf "%03d ");
do
  echo $index
  node --enable-source-maps ./tal-typecheck.mjs < "test-sources/type_annotations_generic_$index.tas"
done
