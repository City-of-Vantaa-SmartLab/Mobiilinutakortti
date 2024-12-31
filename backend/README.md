# Mobiilinutakortti backend

The backend directory includes the server side code for running Mobiilinutakortti app.

Server side is built using NestJS (running on port 3000) and PostgreSQL as database (running on port 5432).

## System requirements:

- NodeJS - v22 preferred
- PostgreSQL - v16 preferred
- Docker (optional)

## Running with Docker

In case you only wish to run the backend + database in docker, a helper script is provided.

1. Run `./build_docker_backend.sh` (make the file executable first)
2. Once the backend and database containers are up and running navigate to [http://localhost:3000/api](http://localhost:3000/api) and you'll see the message *"API is running"*

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

  * The RSA private key of the test environment. When you have it, store it in `backend/certs/nutakortti-test_private_key.pem`. This will make the backend service use that for TLS communication also, enabling HTTPS automatically. Note that normally (e.g. in production) the certificate for TLS is different from the SAML signing certificate, but here we would use the same one.
  * The default HTTPS port 443 redirected to your local backend port.

In many systems (e.g. Linux), port numbers below 1024 are privileged. If you don't want to run the service with elevated privileges, in Linux you could forward the port for example with *iptables*:

  sudo iptables -t nat -A OUTPUT -p tcp -o lo --dport 443 -j REDIRECT --to-ports 3000

Or, in Mac OSX (might not work exactly like this, check out if you have lo0):

  echo "rdr pass on lo0 inet proto tcp from any to 127.0.0.1 port 443 -> 127.0.0.1 port 3000" | sudo pfctl -ef -

## Creating an initial admin user

If you are not using Microsoft Entra ID to login users (as is by default; see environment variables section below), you need to add an initial admin user. See the generic README.md at the root of the repository *(../README.md)* on instructions how to create one.

If you are using Microsoft Entra ID to login users, admin privileges are added on user login based on whether the user belongs to a group that has a role called 'Admin'. Configure the two groups (youthworkers and admins) in Entra accordingly, adding the 'Admin' role to the group for admins.

## Testing SMS functionality

To test SMS functionality locally, rename `.env.template` file to `.env` and update the Telia username/password/user fields with right values *(check in Microsoft Teams - Vantaan Kaupunki Wiki page to see whom to contact to get the values)*

## Environment variables / secrets

In the following list the terms "IdP metadata XML" and "metadata XML" are used. The latter refers to service provider metadata, i.e. for this application. The metadata XML refers to the XML file used to register the service to Suomi.fi. Similarly, IdP metadata XML is the identity provider's (Suomi.fi) metadata file.

* `AUTH_SIGNKEY`: Secret string used to sign and validate the auth tokens. Arbitrary.
* `AWS_SES_KEY_ID`: Key ID for Amazon SES.
* `AWS_SES_KEY_VALUE`: Key value for Amazon SES.
* `AWS_SES_REGION`: Aws region for Amazon SES. For example: "eu-central-1".
* `EMAIL_SOURCE`: Email address to be shown as sender address when seding emails from Amazon SES.
* `EMAIL_RETURN_PATH`: Email where AWS error notifications/bounces are sent, such as invalid email addresses tms.
* `ENTRA_ADMIN_ROLE`: Determines the Entra ID (group) role for detecting who should have admin privileges.
* `ENTRA_APP_KEY_DISCOVERY_URL`: Entra ID key (certificate) discovery URL for the application, if Entra ID is to be used. The format is: `https://login.microsoftonline.com/<TENANT ID>/discovery/keys?appid=<APP ID>`. If given, login and user management based on database data will be disabled.
* `CERT_SELECTION`: Possible values are `test` and `prod`. Determines which set of certificates to use in SAML2.0 communication with Suomi.fi. The certificates are stored in the `certs` directory.
* `DETAILED_LOGS`: If evaluates to true, use detailed logs. This basically prints ids of objects being operated on, for almost every operation. This might result in a lot of logs, so off by default.
* `FRONTEND_BASE_URL`: Base URL for frontend. Used e.g. in redirecting the user during SSO process.
* `HTTP_LOG_LEVEL`: Optional. A pino logger level as string. Defaults to 'info'. Use 'debug' or 'silent' to hide HTTP access logs.
* `IDP_ENTITY_ID`: Entity ID of the identity provider, Suomi.fi in this case. Defined in the IdP metadata XML.
* `JSON_LOGS`: If evaluates to true, use JSON log format.
* `JWT`: Secret string used for JWTs. Arbitrary.
* `KOMPASSI_API_KEY`: API key for Kompassi integration, if integration enabled in admin-frontend.
* `KOMPASSI_API_URL`: URL to use for Kompassi integration.
* `RDS_DB_NAME`: Amazon RDS database name.
* `RDS_HOSTNAME`: Amazon RDS URL host part.
* `RDS_PASSWORD`: Amazon RDS password.
* `RDS_PORT`: Amazon RDS port.
* `RDS_USERNAME`: Amazon RDS user name.
* `SETUP_ENDPOINTS`: If "yes", allows creating a new admin via _registerAdmin_ endpoint and enables creating test junior data via endpoints. See the project root readme for details.
* `SP_ASSERT_ENDPOINT`: Endpoint address for Assertion Consumer Service in SAML2.0 communication. Defined in metadata XML.
* `SP_ENTITY_ID`: Entity ID of the service. Defined in metadata XML.
* `SP_PKEY`: Private key of the service for SAML2.0 communication with Suomi.fi. Note: not the TLS private key. If entering this as an environment variable, separate new lines using "\n" - they are converted to real newline characters while reading the key.
* `SSO_LOGIN_URL`: Identity provider's login URL. Defined in the IdP metadata XML.
* `SSO_LOGOUT_URL`: Identity provider's logout URL. Defined in the IdP metadata XML.
* `TELIA_BATCH_ENDPOINT`: Telia SMS service batch endpoint URL. NB: your Telia credentials must have a separate permit to use the end point.
* `TELIA_ENDPOINT`: Telia SMS service endpoint URL.
* `TELIA_PASSWORD`: Telia SMS service password.
* `TELIA_USER`: The name of the sender as it appears on SMS messages.
* `TELIA_USERNAME`: Telia SMS service user name.

## Swagger documentation

Swagger documentation endpoint located is at `api/swagger`. The documentation is configured so that endpoints are auto generated, along with their comments. Future endpoints should be annotated for authentication level and other tags.

There are 3 authentication level corresponding to 3 levels of users: admin, youth worker, and junior. Certain endpoints are only available to certain levels.

The Swagger documentation does not document API responses.

## Tests

Due to historical reasons, some/most of the tests fail. Feel free to fix and document them.
Also, even though PostgreSQL is used, the tests use SQLite. As it doesn't have a date data type, in some places of the code there are special cases for the tests to work.
