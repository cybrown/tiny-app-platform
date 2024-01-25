#!/bin/sh

has_errors=false

while read -r path
do
  name_with_extension=$(basename "$path")
  name="${name_with_extension%.*}"
  diff -q "actual/$name.sync.txt" "expected/$name.sync.txt" || has_errors=true
  diff -q "actual/$name.async.txt" "expected/$name.async.txt" || has_errors=true
  diff -q "actual/$name.ir.txt" "expected/$name.ir.txt" || has_errors=true
done <<< $(ls test-sources/*.tas)

if  [ $has_errors = true ]
then
  exit 1
fi
