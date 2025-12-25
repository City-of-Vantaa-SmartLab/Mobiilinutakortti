# Mobiilinutakortti backend

The backend directory includes the server side code of the Mobiilinutakortti app.

The backend uses NestJS. The database is PostgreSQL.

## System requirements:

- Node.js: v24.11.0 preferred
- PostgreSQL: v16 preferred
- Docker: optional

## Multiple instances

There are some services that rely on an in-memory "database". If the backend was to run as multiple instances, these services might not work correctly. If ever multiple instances are required, these services might need to be refactored to use a real database. The relevant services are:
* src/kompassi/kompassi.service.ts
* src/session/sessionDb.service.ts
* src/spamGuard/spamGuard.service.ts

Also note that the environment variables `SC_SECRET` and `JWT_SECRET` are required if multiple instances are used.

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

1. Run `npm install`
2. Before running the backend, set database-related environment variables to match your system configuration (the variables beginning with `RDS_`):
    * For example: `export RDS_HOSTNAME=localhost` would use a PostgreSQL install on localhost
    * The username and password are for PostgreSQL
    * PostgreSQL roles can be checked with psql using the command `\du`
3. Run `npm run dev`

Once the backend and database are up and running locally  navigate to [http://localhost:3000/api](http://localhost:3000/api) and you'll see the message *"API is running"*.

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

To test SMS functionality locally, copy `.env.template` file to `.env` and set the Telia username/password/user variables.

## Environment variables / secrets

In the following list the terms "IdP metadata XML" and "metadata XML" are used. The latter refers to service provider metadata, i.e. for this application. The metadata XML refers to the XML file used to register the service to Suomi.fi. Similarly, IdP metadata XML is the identity provider's (Suomi.fi) metadata file.

* `AWS_SES_KEY_ID`: Key ID for Amazon SES.
* `AWS_SES_KEY_VALUE`: Key value for Amazon SES.
* `AWS_SES_REGION`: Aws region for Amazon SES. For example: "eu-central-1".
* `CERT_SELECTION`: Possible values are `test` and `prod`. Determines which set of certificates to use in SAML2.0 communication with Suomi.fi. The certificates are stored in the `certs` directory.
* `EMAIL_SOURCE`: Email address to be shown as sender address when seding emails from Amazon SES.
* `EMAIL_RETURN_PATH`: Email where AWS error notifications/bounces are sent, such as invalid email addresses tms.
* `ENABLE_SETUP_ENDPOINTS`: If "yes", allows creating a new admin via _registerAdmin_ endpoint and enables creating test junior data via endpoints. See the project root readme for details.
* `ENTRA_ADMIN_ROLE`: Determines the Entra ID (group) role for detecting who should have admin privileges.
* `ENTRA_APP_KEY_DISCOVERY_URL`: Entra ID key (certificate) discovery URL for the application, if Entra ID is to be used. The format is: `https://login.microsoftonline.com/<TENANT ID>/discovery/keys?appid=<APP ID>`. If given, login and user management based on database data will be disabled.
* `FRONTEND_URL`: Base URL for frontend. Used e.g. in redirecting the user during SSO process.
* `HTTP_LOG_LEVEL`: A pino logger level as string. Optional, defaults to 'info'. Use 'debug' or 'silent' to hide HTTP access logs.
* `IDP_ENTITY_ID`: Entity ID of the identity provider, Suomi.fi in this case. Defined in the IdP metadata XML.
* `JWT_SECRET`: Secret string used for JWTs. Arbitrary. Optional if only single backend instance is in use.
* `KOMPASSI_API_KEY`: API key for Kompassi integration, if integration enabled in admin-frontend.
* `KOMPASSI_API_URL`: URL to use for Kompassi integration.
* `NODE_ENV`: used to check if running tests (value = 'test') or not.
* `RDS_DB_NAME`: Amazon RDS database name.
* `RDS_HOSTNAME`: Amazon RDS URL host part.
* `RDS_PASSWORD`: Amazon RDS password.
* `RDS_PORT`: Amazon RDS port.
* `RDS_USERNAME`: Amazon RDS user name.
* `SC_SECRET`: Secret string used to sign and validate security context tokens. Arbitrary. Optional if only single backend instance is in use.
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
* `USE_DETAILED_LOGS`: If evaluates to true, use detailed logs. This basically prints ids of objects being operated on, for almost every operation. This might result in a lot of logs, so off by default.
* `USE_JSON_LOGS`: If evaluates to true, use JSON log format.

## Swagger documentation

Swagger documentation endpoint located is at `api/swagger`. The documentation is configured so that endpoints are auto generated, along with their comments. Future endpoints should be annotated for authentication level and other tags.

There are 3 authentication level corresponding to 3 levels of users: admin, youth worker, and junior. Certain endpoints are only available to certain levels.

The Swagger documentation does not document API responses.

## Tests

Even though PostgreSQL is used, the tests use SQLite. As it doesn't have a date data type, in some places of the code there are special cases for the tests to work.

The tests do not currently work correctly due to historical reasons.

## Maintenance

### Dependency version constraints

Some dependencies have specific version constraints documented in `package.json` for compatibility or security reasons:

**TypeScript (`~5.5.0`)**
- Locked to 5.5.x due to breaking type changes in TypeScript 5.6+
- TypeScript 5.9.3 introduced stricter type checking that causes compilation errors in `@oozcitak/util` (a dependency of xmlbuilder2)
- The affected types are `SetIterator` missing `[Symbol.dispose]` property required by TypeScript 5.9+
- Upgrading to 5.6+ would require upstream fixes in xmlbuilder2's dependencies

**js-yaml (via `overrides` section)**
- Forced to `^4.1.0` for all dependencies to patch security vulnerabilities
- The vulnerable version `js-yaml@3.14.0` was a nested dependency via: `saml2-js` → `xmlbuilder2` → `js-yaml@3.14.0`
- This is safe because our code only uses xmlbuilder2 with JavaScript objects, not YAML parsing
- The YAMLReader class in xmlbuilder2 (which uses js-yaml) is never invoked by our SSO/SAML code
- Verification tests exist in `src/sso/sso.service.spec.ts` to ensure XML building continues to work

**node-gyp and test-exclude (via `overrides` section)**
- `node-gyp` forced to `^12.0.0` to eliminate deprecation warnings from older versions (8.x)
- `test-exclude` forced to `^7.0.0` to eliminate glob@7.x deprecation warnings
- These overrides affect test-time dependencies only (sqlite3 uses node-gyp for native compilation)
