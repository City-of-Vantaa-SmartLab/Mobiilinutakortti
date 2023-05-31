#!/usr/bin/env bash
# Use Compose V2
# Bust cache by default. Override with a parameter.
DOCKER_BUILDKIT=0 docker compose -f docker-compose.yml.local build --build-arg BUILD_ID=${1:-$(date +%s)}
docker compose -f docker-compose.yml.local up
