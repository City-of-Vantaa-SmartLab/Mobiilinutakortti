# Mobiilinutakortti

## System Requirements

- Docker
- Node JS - v10
- PostgreSQL - v11

*NOTE: **Only Docker is needed to run the app.** If you want to run backend locally, you'll need NodeJS and PostgreSQL installed. More info in [./backend](https://github.com/City-of-Vantaa-SmartLab/Mobiilinutakortti/tree/master/backend)*

## Tools Used

- Frontend : React *(running on port 3001)*
- Backend : NestJS *(running on port 3000)*
- Admin-Frontend : React Admin *(running on port 5000)*
- Database : PostgreSQL *(running on port 5432)*

## Running The App

To get the app up and running, run:

`docker-compose up`

Once the process has finished, to make sure everything is working fine - navigate to:

- [http://localhost:3001](http://localhost:3001) - for frontend

- [http://localhost:5000](http://localhost:5000) - for admin-frontend

- [http://localhost:3000](http://localhost:3000/api) - for backend

If you can see the webpage for frontend and admin-frontend & *"API is running"* message for backend, you're good to go.

### Using `curl` To Create Admin User
---
Run the following `curl` command to create an admin user

```bash
curl --location --request POST 'http://localhost:3000/api/admin/registerTemp' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "test@test.com",
    "password": "test",
    "firstName": "admin",
    "lastName": "admin",
    "isSuperUser": "true"
}'
```

### Using GUI Tool to Create Admin User
---

Alternatively, you can use GUI tools like Postman/Insomnia to create admin user.

POST to [http://localhost:3000/api/admin/registerTemp](http://localhost:3000/api/admin/registerTemp) with following body:

```json
{
	"email":"test@tests.com",
	"password": "test",
	"firstName": "admin",
	"lastName": "admin",
	"isSuperUser": "true"
}
```

Now you can login to admin-frontend with given credentials.

## Troubleshooting

Docker volumes sometimes get messed up, and database won't work, often indicated by login not working. Often this is indicated by error message:

`Failed Password Authentication for user 'postgres'`

Run:

`docker-compose down`

Remove application volumes from postgres and run application again.