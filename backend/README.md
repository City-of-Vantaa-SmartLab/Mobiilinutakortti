# Mobiilinutakortti backend

The backend directory includes the server side code for running Mobiilinutakortti app.

Server side is built using NestJS (running on port 3000) and PostgreSQL as database (running on port 5432).

## System requirements:

- Docker
- Node JS - v10
- PostgreSQL - v11 (probably works with v10 and v12 also)

## Running with Docker

1. Provided docker is running locally on your machine, run `./build_docker_backend.sh` (make the file executable first)
2. Once the backend and database containers are up and running, to make sure the everything is working fine - navigate to [http://localhost:3000/api](http://localhost:3000/api) and you'll see the message *"API is running"*

### Accessing the NestJS/PostgreSQL Docker container

1. `docker ps` : lists docker containers running
2. `docker exec -it backend_app_1 sh` : gain access to NestJS docker container
3.  `docker exec -it backend_db_1 sh` : gain access to PostgreSQL docker container
    1) `psql -U postgres` : login with `postgres` user using the `psql` interactive terminal
    2) `\l` : lists all available database in the container *(where you'll find `nuta` database for Mobiilinutakortti app)*
    3) `\c nuta` : connects to `nuta` database
    4) `\dt` : lists all the tables in the database
    5) `\d club` : list schema of `club` table
    6) `table club;` / `select * from club;` : lists all values within `club` table
    7)  `\q` : exit PostgreSQL

## Running locally

**PostgreSQL**

Once PostgreSQL is running locally:
1. Run `psql` to get access to the interactive PostgreSQL terminal. On a Ubuntu default install you'll probably need `sudo -u postgres psql`.
2. Create a new `nuta` database in PostgreSQL using `create database nuta;`
3. `\l` : lists all available PostgreSQL database in local machine *(where you'll find `nuta` database for Mobiilinutakortti app)*

To change password for a PostgreSQL user, use the psql command `\password <user>`. For example, to set the default postgres user password to `password` on a Ubuntu machine:

    $ sudo -u postgres psql postgres
    postgres=# \password postgres

**Backend**

1. Run `npm install` to get all backend packages needed
2. Before running the backend, set environment variables or update the file ./src/configHandler.ts to match your system configuration for these parameters: host, username, password.
    * For example: `export RDS_HOSTNAME=localhost` would use a PostgreSQL install on localhost without editing the file.
    * The username and password are for PostgreSQL
    * PostgreSQL roles can be checked with psql using the command `\du`.
3. Run the backend locally via `npm run start:dev`

Once the backend and database are up and running locally, to make sure the everything is working fine - navigate to [http://localhost:3000/api](http://localhost:3000/api) and you'll see the message *"API is running"*.

## Creating an admin user

The application needs at least one admin user to work properly. See the generic README.md at the root of the repository (../README.md) on instructions how to create one.
