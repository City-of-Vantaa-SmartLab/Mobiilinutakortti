# Mobiilinutakortti admin-frontend

The admin-frontend directory includes the admin side code for Mobiilinutakortti app. The users are youth workers.

## System Requirements:

- NodeJS - v22 preferred

## Running locally

You need to have the backend running before starting the admin-frontend; see `../backend/README.md` for info.

1. Run `npm install`
2. Run `npm run start`
    * if the ports 3000-3001 are taken by the backend and frontend already, you are suggested another port automatically
    * if you choose port 3002, you can see admin-frontend running at [http://localhost:3002](http://localhost:3002)

Note that if you are not using Docker, you need to set the `REACT_APP_API_URL` variable correctly, including the port (e.g. http://localhost:3000/api).

## Creating a youth worker user

If you are not using Microsoft Entra ID to login users (as is by default; see the environment variables section below), you need to add an initial admin user. See the generic README.md at the root of the repository *(../README.md)* on instructions how to create one.

## Environment variables / secrets

There are following environment variables:
* `REACT_APP_API_URL`: the base API URL, e.g. "https://api.mobiilinuta-admin-test.com/api". Defaults to "/api" if not set.
* `REACT_APP_ENABLE_EXTRA_ENTRIES`: if evaluates to true, enable showing the extra entry registry related functions in the admin frontend.
* `REACT_APP_ENABLE_KOMPASSI_INTEGRATION`: if evaluates to true, show Kompassi (a statistics system) related settings in the admin frontend's club views.
* `REACT_APP_ENTRA_CLIENT_ID`: Microsoft Entra client ID, if using Entra ID for login.
* `REACT_APP_ENTRA_REDIRECT_URI`: If using Entra ID for login, the redirect URI configured in the login scope, e.g. "https://nutakortti.vantaa.fi/nuorisotyontekijat/loginEntraID". Note that the page must reside outside react-admin router, as MSAL returns the code as an URL fragment (after a # sign), which also marks a route so there would be a conflict.
* `REACT_APP_ENTRA_TENANT_ID`: Microsoft Entra tenant ID. If given, Microsoft Entra ID will be used for login. Login and user management based on database data will be disabled. A different login page will be used to initiate Entra ID login.

## Entra ID login flow

If using Entra ID to login we require password each time a user wishes to log in. Once the youth worker logs in to Entra ID, an access token is requested from the backend, and then the user's Entra ID account is signed out automatically. The user is then accessing Nutakortti with the access token from the backend.

There are three ways the user can logout: manually from the menu, automatically after a certain idle time, or when going to a club check in page (QR reader). If the user was not logged out from Entra ID, the last one would be a hassle and a security risk.

When opening a club check in page, before logout a random check in code is requested from the backend. That code is then required for the check in to work. This is a security measure because the check in API is not protected otherwise.
