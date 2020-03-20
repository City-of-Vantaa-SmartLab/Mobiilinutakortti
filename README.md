Vantaa UTA

Backend runs in port 3000


Mobile-frontend runs in port 3001

Admin-frontend runs in port 5000
## Installation

Clone repository
From the repository, use the package manager NPM to install dependencies.
```bash
npm install
```
To start the backend, database, mobile-front and admin-front,
run following command in root directory where docker-compose.yml is located
```bash
docker-compose up
``` 
## Testing
Currently there is tests only in backend directory. From there you can simply start them with:
```bash
npm run test
```
Some tests are broken by default, and need to be fixed. So if tests are broken when you run them, it doesn't neccessarily mean you broke them.

## Creating a super-user to gain access to admin-frontend
Using Postman/Insomnia/any alternative:

POST to http://localhost:3000/api/admin/registerTemp

With following body:
```json
{
	"email":"example.example@example.com",
	"password": "admin",
	"firstName": "admin",
	"lastName": "admin",
	"isSuperUser": "true"
}
```
Now you can login to application with given credentials.

## Known problems
Docker volumes sometimes get messed up, and database won't work, often indicated by login not working. Often this is indicated by error message.
``Failed Password Authentication for user 'postgres'``

Run:

```bash
docker-compose down
```
Remove application volumes from postgres and run application again
