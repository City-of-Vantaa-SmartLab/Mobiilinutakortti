#!/bin/bash
# In case you wish to only run the backend + database in Docker.
docker build . -t mobiilinutakortti_backend
docker compose up
