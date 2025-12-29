#!/usr/bin/sh
docker compose -f docker-compose.yml.local build
docker compose -f docker-compose.yml.local up
