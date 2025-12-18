# Mobiilinutakortti frontend

The frontend for Mobiilinutakortti app. This is the part used by the juniors and their guardians.

## System Requirements:

- Node.js: v24.11.0 preferred

## Running locally

You need to have the backend running before starting the frontend; see `../backend/README.md` for info.

1. Run `npm install`
2. Run `npm run start`
    * if the default port 3000 is taken by the backend already, you are suggested another port automatically
    * if you choose port 3001, you can see frontend running at [http://localhost:3001](http://localhost:3001)

Note that if you are not using Docker, you need to set the `REACT_APP_API_URL` variable correctly, including the port (e.g. http://localhost:3000/api).

## Environment variables / secrets

There are two environment variables:
* `REACT_APP_API_URL`: the base API URL, e.g. "https://api.mobiilinuta-admin-test.com/api". Defaults to '/api' if not set.
* `REACT_APP_ALT_ERR_MSG`: if evaluates to true: in parent's junior registration form, use alternative error message. This is e.g. for summertime contact information.
