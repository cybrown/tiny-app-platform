#!/bin/sh

ls test-sources/*.tal | while read -r path
do
  name_with_extension=$(basename "$path")
  name="${name_with_extension%.*}"
  diff -q "actual/$name.json" "expected/$name.json"
  diff -q "actual/$name.tal" "expected/$name.tal"
done
