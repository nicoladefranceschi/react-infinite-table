#!/bin/bash

## this file is used during development of "selfware", that uses react-infinite-table

set -e

npm run build:es
npm run build:css

SELFWARE_PATH=../Selfware/selfware

./node_modules/.bin/rimraf "$SELFWARE_PATH/node_modules/react-infinite-table/dist/"
./node_modules/.bin/rimraf "$SELFWARE_PATH/node_modules/react-infinite-table/src/"

cp -r dist "$SELFWARE_PATH/node_modules/react-infinite-table/dist"

mkdir "$SELFWARE_PATH/node_modules/react-infinite-table/src"
cp -r src/style.scss "$SELFWARE_PATH/node_modules/react-infinite-table/src/"
