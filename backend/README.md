# Mobiilinutakortti backend

The backend directory includes the server side code of the Mobiilinutakortti app.

The backend uses NestJS. The database is PostgreSQL.

## Multiple instances

There are some services that rely on an in-memory "database". If the backend was to run as multiple instances, these services might not work correctly. If ever multiple instances are required, these services might need to be refactored to use a real database. The relevant services are:
* src/kompassi/kompassi.service.ts
* src/session/sessionDb.service.ts
* src/spamGuard/spamGuard.service.ts

Also note that the environment variables `SC_SECRET` and `JWT_SECRET` must be defined if multiple instances are used, because a randomly generated value only works for a single instance.

## Running without Docker

1. Run `npm install`
2. Set database-related environment variables (those that begin with `DB_`)
3. Run `npm run dev`

Once the backend and database are up and running locally, navigate to [http://localhost:3000/api](http://localhost:3000/api) and you'll see the message *"API is running"*.

**Network configuration**

Since the Suomi.fi identity provider for SSO is configured against a test environment in AWS cloud, it expects to talk with the AWS. Therefore it responds with AWS URLs. To make them work locally, the easiest way is to override the Amazon hostname in `/etc/hosts` file:

  127.0.0.1 the-domain-registered-to-suomi.fi

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

## Environment variables / secrets

In the following list the terms "IdP metadata XML" and "metadata XML" are used. The latter refers to service provider metadata, i.e. for this application. The metadata XML refers to the XML file used to register the service to Suomi.fi. Similarly, IdP metadata XML is the identity provider's (Suomi.fi) metadata file.

* `APPLICATION_PORT`: The port to run the backend on. Optional, defaults to 3000. Is overridden in main Dockerfile.
* `AWS_SES_KEY_ID`: Key ID for Amazon SES.
* `AWS_SES_KEY_VALUE`: Key value for Amazon SES.
* `AWS_SES_REGION`: Aws region for Amazon SES. For example: "eu-central-1".
* `CERT_SELECTION`: Possible values are `test` and `prod`. Determines which set of certificates to use in SAML2.0 communication with Suomi.fi. The certificates are stored in the `certs` directory.
* `DB_HOST`: Database URL, host part.
* `DB_NAME`: Database name.
* `DB_PASSWORD`: Database password.
* `DB_POOL_SIZE`: Database connection pool size. Defaults to 10.
* `DB_PORT`: Database port.
* `DB_USE_SSL`: If evaluates to true, database uses SSL. Defaults to empty (evaluates to false).
* `DB_USERNAME`: Database user name.
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

Due to historical reasons, the tests might not be the best ones and they might be lacking in coverage. Some unit tests are a bit like e2e tests, so the distinction is not clear. Both test suites should pass, however.
