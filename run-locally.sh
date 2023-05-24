#!/usr/bin/env bash
# Use Compose V2
docker compose -f docker-compose.yml.local build
docker compose -f docker-compose.yml.local up
