#!/bin/sh

ls test-sources/*.tas | while read -r path
do
  name_with_extension=$(basename "$path")
  name="${name_with_extension%.*}"
  diff -q "actual/$name.json" "expected/$name.json"
  diff -q "actual/$name.tas" "expected/$name.tas"
done
