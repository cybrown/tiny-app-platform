#! /bin/bash

source ~/gh-token.sh
docker build --no-cache -t tap-webapp-beta --build-arg GH_TOKEN .
