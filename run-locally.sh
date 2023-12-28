#!/usr/bin/env bash
# Use Compose V2
# Bust cache by default. Override with a parameter.
# Use previous build ID with: ./run-locally.sh cache
build_id=$(date +%s)
[ "$1" == "cache" ] && build_id=$(cat .last-local-build-id)
[ "$1" != "cache" ] && [ "$1" ] && build_id=$1
echo "$build_id" > .last-local-build-id
DOCKER_BUILDKIT=0 docker compose -f docker-compose.yml.local build --build-arg BUILD_ID=$build_id
docker compose -f docker-compose.yml.local up
