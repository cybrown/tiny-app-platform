#!/bin/sh

# Dummy script to run a command with a specific input file.
# This is useful for testing purposes.

#node ./tal-parse-to-json.mjs < "test-sources/type_annotations_generic_001.tas"
for index in $(seq 7 13 | xargs -n 1 printf "%03d ");
do
  echo $index
  node ./tal-typecheck.mjs < "test-sources/type_annotations_generic_$index.tas"
done
