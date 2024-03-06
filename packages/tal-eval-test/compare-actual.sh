#!/bin/bash

has_errors=false

while read -r path
do
  name_with_extension=$(basename "$path")
  name="${name_with_extension%.*}"
  diff -q "actual/$name.asm.txt" "expected/$name.asm.txt" || has_errors=true
  diff -q "actual/$name.txt" "expected/$name.txt" || has_errors=true
done <<< "$(ls test-sources/*.tas)"

if  [ $has_errors = true ]
then
  exit 1
fi
