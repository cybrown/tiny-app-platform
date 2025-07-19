#!/bin/sh

# Dummy script to run a command with a specific input file.
# This is useful for testing purposes.

#node ./tal-parse-to-json.mjs < "test-sources/type_annotations_generic_001.tas"
node ./tal-typecheck.mjs < "test-sources/type_annotations_generic_004.tas"
node ./tal-typecheck.mjs < "test-sources/type_annotations_generic_005.tas"
