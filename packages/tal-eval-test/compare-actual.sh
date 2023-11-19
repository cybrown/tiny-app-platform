#!/bin/sh

ls test-sources/*.tas | while read -r path
do
  name_with_extension=$(basename "$path")
  name="${name_with_extension%.*}"
  diff -q "actual/$name.sync.txt" "expected/$name.sync.txt"
  diff -q "actual/$name.async.txt" "expected/$name.async.txt"
  diff -q "actual/$name.ir.txt" "expected/$name.ir.txt"
done
