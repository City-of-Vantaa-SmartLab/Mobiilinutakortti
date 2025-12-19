# Mobiilinutakortti frontend

The frontend for Mobiilinutakortti app. This is the part used by the juniors and their guardians.

## System Requirements:

- Node.js: v24.11.0 preferred

## Running locally

You need to have the backend running before starting the frontend; see `../backend/README.md` for info.

1. Run `npm install`
2. Run `npm run dev`
    * the default dev server port is 3000; if it is taken, Vite will fall back to the next free port (e.g., 3001)
    * open the URL (typically http://localhost:3000 or http://localhost:3001)

Note that if you are not using Docker, you need to set the `VITE_API_URL` variable correctly, including the port (e.g. http://localhost:3000/api).

## Environment variables / secrets

There are two environment variables:
* `VITE_API_URL`: the base API URL, e.g. "https://api.mobiilinuta-admin-test.com/api". Defaults to '/api' if not set.
* `VITE_ALT_ERR_MSG`: if evaluates to true: in parent's junior registration form, use alternative error message. This is e.g. for summertime contact information.
