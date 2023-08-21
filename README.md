# Mobiilinutakortti

The application consists of three subprojects: backend, frontend and admin-frontend.
* Admin-frontend is used by the youth workers to handle registered members and their info. The QR code reading is also part of this.
* Frontend is the end user web application used by the youth to see information about the youth clubs and generate a personal QR code for checking in.
* Backend has endpoints for both frontends and for Suomi.fi identification. It uses PostgreSQL for database.

More detailed documentation is found in a README in respective directories of each project.

## Prerequisites

- NodeJS - v16
- PostgreSQL - v11 (seems to work with v10 also; some problems with v12)
- Docker (optional)

**Only Docker is needed to run the app.** If you want to run backend locally, you'll need NodeJS and PostgreSQL installed. More info in ./backend/README.md.

For production use, Telia SMS service is required. Note that there are two endpoints (see environment variables section in backend documentation). **The use of the batch endpoint requires permit separately from Telia. Ensure your credentials have the permit.**

## Technologies

- Frontend : React *(running on port 3001)*
- Backend : NestJS *(running on port 3000)*
- Admin-Frontend : React Admin *(running on port 3002)*
- Database : PostgreSQL *(running on port 5432)*

## Running the app

Each subproject may be run individually, with or without docker - see README.md files of the projects.
To start up everything using Docker compose, **run `docker compose -f docker-compose.yml.local up` in this directory**. Since there might be problems with Docker caching, the `run-locally.sh` helper script is a good alternative.

To make sure everything is working, navigate to:
- [http://localhost:3001](http://localhost:3001) - frontend
- [http://localhost:3002](http://localhost:3002) - admin-frontend (default port will be 3000 if running without Docker)
- [http://localhost:3000/api](http://localhost:3000/api) - backend

If you see the webpage for frontend and admin-frontend, and "API is running" message for backend, you're good.

NOTE:
* If you have PostgreSQL running locally, it is probably using port 5432 and will conflict with the Docker setup. Bring the local instance down or reconfigure it to solve the issue.
* At some point during npm install you might get a weird error like this:

    npm ERR! code EAI_AGAIN
    npm ERR! errno EAI_AGAIN
    npm ERR! request to https://registry.npmjs.org/minimist/-/minimist-1.2.0.tgz failed, reason: getaddrinfo EAI_AGAIN registry.npmjs.org registry.npmjs.org:443

    This is because Docker might have some problems using IPv6 DNS servers. Force the use of IPv4 DNS in your localhost.

## Create an initial admin

The application needs at least one youth worker user to work properly. The backend must be running when executing this step. The endpoint that we call is only open if the environment variable `SUPER_ADMIN_FEATURES` equals "yes", so set it when launching the backend. You can do this temporarily for example by editing the `docker-compose.yml.local` file.

Run the following `curl` command to create a youth worker with admin rights:

```bash
curl --location --request POST 'http://localhost:3000/api/youthworker/registerAdmin' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "test@test.com",
    "password": "test",
    "firstName": "admin",
    "lastName": "admin",
    "isAdmin": "true"
}'
```

### Use other tools
---

Alternatively, you can use GUI tools such as Postman or Insomnia to create a youth worker user.

POST to [http://localhost:3000/api/youthworker/registerAdmin](http://localhost:3000/api/youthworker/registerAdmin) with following body:

```json
{
    "email":"test@test.com",
    "password": "test",
    "firstName": "admin",
    "lastName": "admin",
    "isAdmin": "true"
}
```

Now you can login to admin-frontend with given credentials.

### Note about production

When deploying application to production, endpoint should initially be open, and after creation of youth worker, it should be closed ASAP. The endpoint is toggled by environment variable `SUPER_ADMIN_FEATURES`. Set its value to "yes" to allow registering youth workers via the endpoint and unset the variable (or set as "no") to disable the endpoint afterwards.

## Creating youth clubs

Currently, there's no user interface for creating youth clubs. You can insert them directly to the database to the `clubs` table. For example, the list of youth clubs for Vantaa would be something like:

```sql
insert into public.club (name) values
('Hakunilan nuorisotila'),
('Havukosken nuorisotila'),
('Hiekkaharjun nuorisotila'),
('Kivistön nuorisotila'),
('Kolohongan nuorisotila'),
('Korson nuorisotila'),
('Länsimäen nuorisotila'),
('Martinlaakson nuorisotila'),
('Mikkolan nuorisotila'),
('Myyrmäen nuorisotila'),
('Pakkalan nuorisotila'),
('Pähkinärinteen nuorisotila'),
('Tikkurilan nuorisotila');
commit;
```

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

Bring down the Docker containers with: `docker compose down`

To nuke the database, remove Docker volume from the PostgreSQL container, and bring the application up again.

### admin-frontend (or some other) build errors out

When running "docker compose up" you might get an error like this:

    admin-frontend_1  | events.js:174
    admin-frontend_1  |       throw er; // Unhandled 'error' event
    admin-frontend_1  |       ^
    admin-frontend_1  |
    admin-frontend_1  | Error: ENOSPC: System limit for number of file watchers reached, watch '/admin-frontend/public'

or your build may error randomly.

There's a lot of files under `node_modules` and they are all being watched, reaching the system limit. Each file watcher takes up some kernel memory, and therefore they are limited to some reasonable number by default. On a Ubuntu Linux the limit can be increased for example like this:

    echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p

Increasing memory limits for Docker might also help if for example you are using the Docker Desktop app to constrain them in the first place.

## Environments, AWS and CI

### Test environment

Application runs in Elastic Beanstalk in a single container (using Dockerfile via docker-compose.yml) and is deployed via command-line manually. The name is **nutakortti-vantaa-dev**.

### Production environment

Application runs in Elastic Beanstalk in a single container (using Dockerfile via docker-compose.yml) and is deployed via command-line manually. The name is **nutakortti-vantaa-prod**. See next section for updating the production environment using EB CLI tools.

* [Junior-app](https://nutakortti.vantaa.fi)
* [Admin-app](https://nutakortti.vantaa.fi/nuorisotyontekijat)
* [Api](https://nutakortti.vantaa.fi/api)

Production logs are found in AWS CloudWatch under `/aws/elasticbeanstalk/nutakortti-vantaa-prod/var/log/` (just go to CloudWatch and select Log groups from the left panel). The current app log and nginx access/error logs are of most interest.

### Updating the environments using EB CLI tools

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
4. Select the `Nutakortti` as application. Don't continue with CodeCommit (defaults to N).
5. Ensure the environment is set up by typing `eb list`. You should see **nutakortti-vantaa-prod**.

**Deploy a new version to production:**
* While in the project root directory, type: `eb deploy nutakortti-vantaa-prod`
* To see how things are progressing, type: `eb events -f`
