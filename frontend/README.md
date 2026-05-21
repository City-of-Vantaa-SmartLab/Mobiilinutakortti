# Mobiilinutakortti frontend

The frontend for Mobiilinutakortti app. This is the part used by the juniors and their guardians.

## Running locally

You need to have the backend running before starting the frontend; see `../backend/README.md` for info.

1. Run `npm install`
2. Run `npm run dev`
    * the default dev server port is 3000; if it is taken, Vite will fall back to the next free port (e.g., 3001)
    * open the URL (typically http://localhost:3000 or http://localhost:3001)

## Environment variables / secrets

There are two environment variables:
* `VITE_API_TARGET_HOST`: Hostname where API is running in port 3000, only for dev server. Defaults to `localhost`.
* `VITE_USE_ALT_ERR_MSG`: if evaluates to true: in parent's junior registration form, use alternative error message. This is e.g. for summertime contact information.

Note: in production, the variables will be defined by backend and passed on to frontend by using middleware to intercept fetching of `env.js`.
