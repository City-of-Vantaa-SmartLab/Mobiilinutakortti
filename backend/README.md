# Mobiilinutakortti backend

The backend directory includes the server side code for running Mobiilinutakortti app.

Server side is built using NestJS (running on port 3000) and PostgreSQL as database (running on port 5432).

## System requirements:

- Docker
- Node JS - v10
- PostgreSQL - v11 (seems to work with v10 also; some problems with v12)

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

**Network configuration**

Since the Suomi.fi identity provider for SSO is configured against a test environment in AWS cloud, it expects to talk with the AWS. Therefore it responds with AWS URLs. To make them work locally, the easiest way is to override the Amazon hostname in `/etc/hosts` file:

  127.0.0.1 api.mobiilinuta-admin-test.com

Since Suomi.fi expects to communicate over HTTPS and not HTTP, we will also need to have:

  * The RSA private key of the test environment. When you have it, store it in `backend/certs/nutakortti-test_private_key.pem`. This will make the backend service use that for TLS communication also, enabling HTTPS automatically.
  * The default HTTPS port 443 redirected to your local backend port.

In many systems (e.g. Linux), port numbers below 1024 are privileged. If you don't want to run the service with elevated privileges, in Linux you could forward the port for example with *iptables*:

  sudo iptables -t nat -A OUTPUT -p tcp -o lo --dport 443 -j REDIRECT --to-ports 3000

Or, in Mac OSX (might not work exactly like this, check out if you have lo0):

  echo "rdr pass on lo0 inet proto tcp from any to 127.0.0.1 port 443 -> 127.0.0.1 port 3000" | sudo pfctl -ef -

## Creating an admin user

The application needs at least one admin user to work properly. See the generic README.md at the root of the repository (../README.md) on instructions how to create one.

## Testing SMS functionality

To test SMS functionality locally, rename `.env.template` file to `.env` and update the Telia username/password/user fields with right values *(check in Microsoft Teams - Vantaan Kaupunki Wiki page to see whom to contact to get the values)*

## Task definition / environment variables / secrets

AWS sets up task definitions based on the `task-definition.json` file. This includes environment variables and secrets. Note that in the cloud environment, the secrets are read from environment variables eventually during runtime so these are all basically environment variables, just the inital source of them (AWS Secrets Manager or task definition) might vary.

The secrets are:
* `AUTH_SIGNKEY`: Secret string used to sign and validate the auth tokens. Arbitrary.
* `RDS_PASSWORD`: Amazon RDS password.
* `SP_PKEY`: Private key of the service for SAML2.0 communication with Suomi.fi. Note: not the TLS private key. If entering this as an environment variable, separate new lines using "\n" - they are converted to real newline characters while reading the key.
* `TELIA_PASSWORD`: Telia SMS service password.
* `TELIA_USERNAME`: Telia SMS service user name.

The environment variables are:
* `CERT_SELECTION`: Possible values are `test` and `prod`. Determines which set of certificates to use in SAML2.0 communication with Suomi.fi. The certificates are stored in the `certs` directory.
* `FRONTEND_BASE_URL`: Base URL for frontend. Used e.g. in redirecting the user during SSO process.
* `IDP_ENTITY_ID`: Entity ID of the identity provider, Suomi.fi in this case. Defined in the IdP metadata XML.
* `RDS_DB_NAME`: Amazon RDS database name.
* `RDS_HOSTNAME`: Amazon RDS URL host part.
* `RDS_PORT`: Amazon RDS port.
* `RDS_USERNAME`: Amazon RDS user name.
* `SP_ASSERT_ENDPOINT`: Endpoint address for Assertion Consumer Service in SAML2.0 communication. Defined in metadata XML.
* `SP_ENTITY_ID`: Entity ID of the service. Defined in metadata XML.
* `SSO_LOGIN_URL`: Identity provider's login URL. Defined in the IdP metadata XML.
* `SSO_LOGOUT_URL`: Identity provider's logout URL. Defined in the IdP metadata XML.
* `SUPER_ADMIN_FEATURES`: If "yes", allows creating a new super admin via _registerSuperAdmin_ endpoint and enables creating test junior data via endpoints. See the project root readme for details.
* `TELIA_ENDPOINT`: Telia SMS service endpoint URL.
* `TELIA_USER`: The name of the sender as it appears on SMS messages.

Additionally, the frontend apps require this environment variable:
* `REACT_APP_ENDPOINT`: the base API URL, e.g. "https://api.mobiilinuta-admin-test.com/api"
