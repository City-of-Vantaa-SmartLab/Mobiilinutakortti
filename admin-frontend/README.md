# Mobiilinutakortti admin-frontend

The admin-frontend directory includes the admin side code for Mobiilinutakortti app. The users are youth workers.

Admin-frontend is build using `react-admin` (running on port 3002).

## System Requirements:

- Node JS - v16

## Running locally

1. Run `npm install` to get all admin-frontend pacakges needed
2. Before running the admin-frontend:
    *  ../backend should running *(see ../backend/README.md on how to get backend running)*
    * since the default port react app runs locally *(3000)* is taken by backend, you can set a new port for admin-frontend to run in package.json. `"start": " PORT=3002 react-scripts start"`
3. Run `npm run start` or `npm run dev` - and you'll see admin-frontend running at [http://localhost:3002](http://localhost:3002)

The start script is the same as dev script, but you must set the required environment variables yourself with start.

## Creating a youth worker user

If you are not using Microsoft Entra ID to login users (as is by default; see the environment variables section below), you need to add an initial admin user. See the generic README.md at the root of the repository *(../README.md)* on instructions how to create one.

## Environment variables / secrets

There are following environment variables:
* `REACT_APP_ADMIN_FRONTEND_URL`: URL where to go when an admin logouts, e.g. "/nuorisotyontekijat"
* `REACT_APP_ENABLE_EXTRA_ENTRIES`: if evaluates to true, enable showing the extra entry registry related functions in the admin frontend.
* `REACT_APP_ENDPOINT`: the base API URL, e.g. "https://api.mobiilinuta-admin-test.com/api"
* `REACT_APP_ENTRA_CLIENT_ID`: Microsoft Entra client ID, if using Entra ID for login.
* `REACT_APP_ENTRA_REDIRECT_URI`: If using Entra ID for login, the redirect URI configured in the login scope, e.g. "https://nutakortti.vantaa.fi/nuorisotyontekijat/loginEntraID". Note that the page must reside outside react-admin router, as MSAL returns the code as an URL fragment (after a # sign), which also marks a route so there would be a conflict.
* `REACT_APP_ENTRA_TENANT_ID`: Microsoft Entra tenant ID. If given, Microsoft Entra ID will be used for login. Login and user management based on database data will be disabled. A different login page will be used to initiate Entra ID login.
