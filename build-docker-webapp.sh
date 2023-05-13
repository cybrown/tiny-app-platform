#! /bin/bash

source ~/gh-token.sh
docker build --no-cache -t tap-webapp --build-arg GH_TOKEN .
