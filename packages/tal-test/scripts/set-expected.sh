#!/bin/sh

rm -rf ./actual
rm -rf ./expected

./scripts/generate-actual.sh

cp -r actual expected
