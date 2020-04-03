The backend directory includes the server side code for running Mobiilinutakortti app.

Server side is built using NestJS *(running on port 3000) and* PostgreSQL as database *(running on port 5432)*

## System Requirements:
- Docker
- Node JS - v10
- PostgreSQL - v11

## Running Backend - With Docker
1. Provided docker is running locally on your machine, run `./build_docker_backend.sh`

    *NOTE: make the file executable by running `chmod +x build_docker_backend.sh`*
2. Once the backend and database containers are up and running, to make sure the everything is working fine - navigate to [http://localhost:3000/api](http://localhost:3000/api) and you'll see the message *"API is running"*

    ### Access NestJS/PostgreSQL Docker Container
    ---
    1. `docker ps` : lists docker containers running

    2. `docker exec -it backend_app_1 sh` : gain access to NestJS docker container

    3.  `docker exec -it backend_db_1 sh` : gain access to PostgreSQL docker container

        3.1. `psql -U postgres` : login with `postgres` user using the `psql` interactive terminal

        3.2. `\l` : lists all available database in the container *(where you'll find `nuta` database for Mobiilinutakortti app)*

        3.3. `\c nuta` : connects to `nuta` database

        3.4. `\dt` : lists all the tables in the database

        3.5. `\d club` : list schema of `club` table

        3.6. `table club;` / `select * from club;` : lists all values within `club` table

        3.7.  `\q` : exit PostgreSQL

## Running Backend - Locally
1. **PostgreSQL**

    Once PostgreSQL is running locally

    1.1. Run `psql` to get access to the interactive PostgreSQL terminal

    1.2. Create a new `nuta` database in PostgreSQL using `create database nuta;`

    1.3. `\l` : lists all available PostgreSQL database in local machine *(where you'll find `nuta` database for Mobiilinutakortti app)*

2. **Backend**

    2.1. Run `npm install` to get all backend packages needed

    2.2. Before running the backend, update the "host" in [configHandler.ts](https://github.com/City-of-Vantaa-SmartLab/Mobiilinutakortti/blob/master/backend/src/configHandler.ts) to `localhost` & update the "username", "password" according to username and password set for PostgreSQL your local machine.

      *NOTE: If you're not sure of the "username", check the username via `psql` by running `\du`. By default, the "password" will be `password`.*

    2.3. Run the backend locally via `npm run start:dev`

    Once the backend and database are up and running locally, to make sure the everything is working fine - navigate to [http://localhost:3000/api](http://localhost:3000/api) and you'll see the message *"API is running"*