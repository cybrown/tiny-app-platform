#!/bin/sh

rm -rf ./expected

./generate-actual.sh

cp -r actual expected
