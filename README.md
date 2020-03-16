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





