#!/bin/sh

mkdir artifacts
cd artifacts
curl https://api.github.com/repos/cybrown/tiny-app-platform/actions/artifacts | jq '.artifacts | sort_by(.updated_at) | reverse | @sh "curl -L -H \"Authorization: token $GH_TOKEN\" \(.[0].archive_download_url) -o \(.[0].name).zip\ncurl -L -H \"Authorization: token $GH_TOKEN\" \(.[1].archive_download_url) -o \(.[1].name).zip"' -r > out.sh
sh out.sh

unzip tap-backend.zip
unzip tap-webapp.zip -d web-client

tar xf tap-backend.tar.gz
mv tap-backend backend
