#!/bin/sh

# Dummy script to run a command with a specific input file.
# This is useful for testing purposes.

for index in $(seq 1 2 | xargs -n 1 printf "%03d ");
do
  echo $index
  node --enable-source-maps ./tal-typecheck.mjs < "test-sources/type_annotations_dict_$index.tas"
done

exit 0

#node --enable-source-maps ./tal-parse-to-json.mjs < "test-sources/type_annotations_generic_001.tas"
for index in $(seq 7 13 | xargs -n 1 printf "%03d ");
do
  echo $index
  node --enable-source-maps ./tal-typecheck.mjs < "test-sources/type_annotations_generic_$index.tas"
done
