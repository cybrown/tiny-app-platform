#! /bin/bash

source ~/gh-token.sh
docker build -t tap-webapp --build-arg GH_TOKEN .
