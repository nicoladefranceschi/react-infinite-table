#!/bin/bash

## this file is used during development of "selfware", that uses react-infinite-table

set -e

npm run build:es
npm run build:css

./node_modules/.bin/rimraf ../Selfware/selfware/node_modules/react-infinite-table/dist/

cp -r dist ../Selfware/selfware/node_modules/react-infinite-table/dist
