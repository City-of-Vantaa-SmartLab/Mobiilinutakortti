# Mobiilinutakortti admin-frontend

The admin-frontend directory includes the admin side code for Mobiilinutakortti app.

Admin-frontend is build using `react-admin` (running on port 5000).

## System Requirements:

- Node JS - v10

## Running locally

1. Run `npm install` to get all admin-frontend pacakges needed
2. Before running the admin-frontend:
    *  ../backend should running *(see ../backend/README.md on how to get backend running)*
    * since the default port react app runs locally *(3000)* is taken by backend, you can set a new port for admin-frontend to run in package.json. `"start": " PORT=5000 react-scripts start"`
3. Run `npm run start` - and you'll see admin-frontend running at [http://localhost:5000](http://localhost:5000)

## Creating an admin user

The application needs at least one admin user to work properly. See the generic README.md at the root of the repository *(../README.md)* on instructions how to create one.

## Task definition / environment variables / secrets

There's one environment variable:
* `REACT_APP_ENDPOINT`: the base API URL, e.g. "https://api.mobiilinuta-admin-test.com/api"
