#!/usr/bin/env bash
docker-compose -f docker-compose.yml.local build && docker-compose -f docker-compose.yml.local up
