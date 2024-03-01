#!/usr/bin/env bash

# go to current folder
cd "$(dirname "$0")"

# add env vars
if [ -f .env ]; then
  export $(echo $(cat .env | sed 's/#.*//g'| xargs) | envsubst)
fi

# check creds
if [ -z "${DEPLOY_HOST+xxx}" ]; then echo "DEPLOY_HOST not set" && exit; fi
if [ -z "${DEPLOY_USER+xxx}" ]; then echo "DEPLOY_USER not set" && exit; fi
if [ -z "${DEPLOY_PASSWORD+xxx}" ]; then echo "DEPLOY_PASSWORD not set" && exit; fi

IPFS_PATH=./.ipfs ./kubo init
IPFS_PATH=./.ipfs ./kubo config show
IPFS_PATH=./.ipfs ./kubo config --json Addresses.Gateway '"/ip4/127.0.0.1/tcp/57890"'
IPFS_PATH=./.ipfs ./kubo config --json Addresses.API '"/ip4/127.0.0.1/tcp/57891"'
IPFS_PATH=./.ipfs ./kubo config --json Addresses.Swarm '["/ip4/0.0.0.0/tcp/57892","/ip6/::/tcp/57892","/ip4/0.0.0.0/udp/57892/quic-v1","/ip4/0.0.0.0/udp/57892/quic-v1/webtransport"]'
# ps -ax | grep ipfs
kill $(ps aux | grep kubo | awk '{print $2}')
sleep 10
IPFS_PATH=./.ipfs ./kubo daemon --enable-pubsub-experiment &
sleep 10
IPFS_PATH=./.ipfs ./kubo pubsub sub demo &
while true; do echo "hello from kubo localhost" | IPFS_PATH=./.ipfs ./kubo pubsub pub demo; sleep 1; done
