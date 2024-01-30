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

## Entra ID login flow

If using Entra ID to login we would like to require password each time a user wishes to log in. That causes trouble.

Ideally, we would just empty MSAL cache in the browser. That data, however, is under microsoft.com domain and hence unreachable.

Another option would be to configure in Entra ID to ask for password each time credentials are prompted for, but this is possible only for Azure cloud-native apps.

A third option we considered was to rely on a 10 minute access token lifetime - after that time, MSAL would be effectively logged out. However, in practice this didn't seem to work reliably and we had to resort to explicitly asking the user to log out. This is because as part of login flow, normally [acquireTokenSilent](https://learn.microsoft.com/en-us/entra/identity-platform/scenario-spa-acquire-token) would be called. It uses the refresh token if access token lifetime has been reached. The refresh token's lifetime is always 24 hours for SPA apps. And even if acquireTokenSilent weren't called and refresh tokens never used, if a user just closed the browser after signing in, there would be 10 minutes available for attackers to re-login without a password.

There are three ways the user can logout: manually from the menu, automatically after idle time (15 minutes), or when going to a club check in page (QR reader). The last one is not only a hassle, but the automatic logout is a security risk: if we wouldn't log out the user explicitly, they might still be logged in to Entra ID unbeknownst to the user. Then again if we do ask the user to log out explicitly, the auto-logout would end up in the "choose which account to log out from" dialog.

Because of these problems it was decided to explicitly log out the user immediately after logging in. The last commit before this change in case the other type of login flow (without explicit log out prompt after logging in) is considered:

    commit:  1eff0f24825c236753379dd207e739f1b594cfd4
    Date:    Thu Jan 25 18:04:31 2024 +0200
    Message: chore: Entra ID cleanup, better error handling
