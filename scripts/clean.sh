#!/bin/sh

# Remove all node_modules, package-lock.json and build artifacts, except for electron

rm -rf node_modules
rm package-lock.json
ls packages | while read line
do
  rm -rf "$line/node_modules"
  rm -rf "$line/dist"
done
