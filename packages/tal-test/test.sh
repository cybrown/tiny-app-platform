#!/bin/sh

echo "Generate actual"
./scripts/generate-actual.sh

echo "Compare actual"
./scripts/compare-actual.sh
