# Mobiilinutakortti

The application consists of three subprojects: backend, frontend and admin-frontend.
* Admin-frontend is used by the youth workers to handle registered members and their info. The QR code reading is also part of this.
* Frontend is the end user web application used by the youth to see information about the youth clubs and generate a personal QR code for checking in.
* Backend has endpoints for both frontends and for Suomi.fi identification. It uses PostgreSQL for database.

More detailed documentation is found in a README in respective directories of each project.

## Prerequisites

- Docker
- NodeJS - v10
- PostgreSQL - v11 (seems to work with v10 also; some problems with v12)

**Only Docker is needed to run the app.** If you want to run backend locally, you'll need NodeJS and PostgreSQL installed. More info in ./backend/README.md.

## Technologies

- Frontend : React *(running on port 3001)*
- Backend : NestJS *(running on port 3000)*
- Admin-Frontend : React Admin *(running on port 3002)*
- Database : PostgreSQL *(running on port 5432)*

## Running the app

Each subproject may be run individually, with or without docker - see README.md files of the projects.
To start up everything using Docker compose, **run `docker-compose up` in this directory**.

To make sure everything is working, navigate to:
- [http://localhost:3001](http://localhost:3001) - frontend
- [http://localhost:3002](http://localhost:3002) - admin-frontend (default port will be 3000 if running without Docker)
- [http://localhost:3000/api](http://localhost:3000/api) - backend

If you see the webpage for frontend and admin-frontend, and "API is running" message for backend, you're good.

NOTE:
* If you have PostgreSQL running locally, it is probably using port 5432 and will conflict with the Docker setup. Bring the local instance down or reconfigure it to solve the issue.
* Docker might not start all the services especially if you encounter some problems somewhere at any point. In this case, just **try to compose up again**.
* At some point during npm install you might get a weird error like this:

    npm ERR! code EAI_AGAIN
    npm ERR! errno EAI_AGAIN
    npm ERR! request to https://registry.npmjs.org/minimist/-/minimist-1.2.0.tgz failed, reason: getaddrinfo EAI_AGAIN registry.npmjs.org registry.npmjs.org:443

    This is because Docker has some problems using IPv6 DNS servers. Force the use of IPv4 DNS in your localhost.

## Creating an admin user

The application needs at least one admin user to work properly. The backend must be running when executing this step. The endpoint that we call is only open if the environment variable `SUPER_ADMIN_FEATURES` equals "yes", so set it when launching the backend.

### Use curl

Run the following `curl` command to create an admin user

```bash
curl --location --request POST 'http://localhost:3000/api/admin/registerSuperAdmin' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "test@test.com",
    "password": "test",
    "firstName": "admin",
    "lastName": "admin",
    "isSuperUser": "true"
}'
```

### Use other tools
---

Alternatively, you can use GUI tools such as Postman or Insomnia to create an admin user.

POST to [http://localhost:3000/api/admin/registerSuperAdmin](http://localhost:3000/api/admin/registerSuperAdmin) with following body:

```json
{
    "email":"test@test.com",
    "password": "test",
    "firstName": "admin",
    "lastName": "admin",
    "isSuperUser": "true"
}
```

Now you can login to admin-frontend with given credentials.

### Note about production

When deploying application to production, endpoint should initially be open, and after creation of admin, it should be closed ASAP. The endpoint is toggled by environment variable `SUPER_ADMIN_FEATURES`. Set its value to "yes" to allow registering admins via the endpoint and unset the variable (or set as "no") to disable the endpoint afterwards.

Note that in the task-definition.json the default value is "yes". Keep this in mind if you use the task definitions for production.

## Testing SMS functionality

To test SMS functionality locally, rename `.env.template` file to `.env` in */backend* and update the Telia username/password/user fields with right values *(check in Microsoft Teams - Vantaan Kaupunki Wiki page to see whom to contact to get the values)*

## Creating test data

With the `SUPER_ADMIN_FEATURES` enabled and the backend running, use these two to create and remove test youth data:
* Create 100 test cases: `curl --location --request POST 'http://localhost:3000/api/junior/createTestDataJuniors' --header 'Content-Type: application/json' --data-raw '{ "numberOfCases": "100" }'`
* Delete all created test cases: `curl --location --request POST 'http://localhost:3000/api/junior/deleteTestDataJuniors' --header 'Content-Type: application/json'`

## QR-code reading

Qr-code check-in endpoint is open by default, and should be accessible without authentication. This is due the removal of session-token when entering to QR-code screen, to prevent end-user to navigate to other parts of the application.

## Troubleshooting

### Login not working

Docker volumes sometimes get messed up and database won't work, often indicated by login not working. This might be indicated by error message such as:

`Failed Password Authentication for user 'postgres'`

Bring down the Docker containers with: `docker-compose down`

To nuke the database, remove Docker volume from the PostgreSQL container, and bring the application up again.

### admin-frontend (or some other) build errors out

When running "docker-compose up" you might get an error like this:

    admin-frontend_1  | events.js:174
    admin-frontend_1  |       throw er; // Unhandled 'error' event
    admin-frontend_1  |       ^
    admin-frontend_1  |
    admin-frontend_1  | Error: ENOSPC: System limit for number of file watchers reached, watch '/admin-frontend/public'

or your build may error randomly.

There's a lot of files under node_modules and they are all being watched, reaching the system limit. Each file watcher takes up some kernel memory, and therefore they are limited to some reasonable number by default. On a Ubuntu Linux the limit can be increased for example like this:

    echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p

Increasing memory limits for Docker might also help if for example you are using the Docker Desktop app to constrain them in the first place.

## Environments, AWS and CI

### CI

GitHub uses github-actions to push master branch to test-environment, when push or merge occurs to the master branch. For more information, see the "Actions" tab in GitHub.

### Test environment

Application runs in Elastic Container Service (eu-west-1), with 3 different services:

* [youth-club-server-service](https://api.mobiilinuta-admin-test.com/api)
* [youth-club-mobile-front](http://youth-club-mobile-lb-74625212.eu-west-1.elb.amazonaws.com)
* [youth-club-admin-front-2](https://mobiilinuta-admin-test.com)

Application images are stored in Elastic Container Registry.
You shouldn't need to update images or services manually, since Github does that for you.

### Production environment

Application runs in Elastic Beanstalk and is deployed via command-line manually. The name is **Vantaa-Youth-PWA-prod**. See next section for updating the production environment using EB CLI tools.

* [Junior-app](https://nutakortti.vantaa.fi)
* [Admin-app](https://nutakortti.vantaa.fi/nuorisotyontekijat)
* [Api](https://nutakortti.vantaa.fi/api)

Production logs are found in AWS CloudWatch in the Frankfurt (eu-central-1) region under `/aws/elasticbeanstalk/Vantaa-Youth-PWA-prod/var/log/` (just go to CloudWatch and select Log groups from the left panel). The current app log and nginx access/error logs are of most interest.

NOTE: **The production database** (AWS RDS) is attached to the Elastic Beanstalk environment, so it depends on the lifecycle of the Beanstalk environment (which is not optimal for production environment but that's how it is).

### Updating the production environment using EB CLI tools

Install the tools (for quick setup, follow the README in GitHub):
* [AWS docs](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html)
* [GitHub](https://github.com/aws/aws-elastic-beanstalk-cli-setup)
* Remember to add EB CLI to PATH (e.g. `export PATH="/home/username/.ebcli-virtual-env/executables:$PATH"`).

Configure the EB CLI:
* [AWS docs](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-configuration.html)
* Note: this process only initializes the current directory/repository on your computer. The relevant files have been added to gitignore.
1. Go to project directory root (where this file is). Type: `eb init`.
2. Select `eu-central-1` as the location (unless something's been changed).
3. If you haven't set up your AWS credentials yet, provide your personal Access key ID and Secret access key. You got them when receiving the AWS credentials (you should have got the following: **User name,Password,Access key ID,Secret access key,Console login link**). On Linux/OS X, the credentials will be stored in `~/.aws/config`.
4. Select the `Vantaa-Youth-PWA` as application. Don't continue with CodeCommit (defaults to N).
5. Ensure the environment is set up by typing `eb list`. You should see **Vantaa-Youth-PWA-prod**.

**Deploy a new version to production:**
* While in the project root directory, type: `eb deploy Vantaa-Youth-PWA-prod`
* To see how things are progressing, type: `eb events -f`
