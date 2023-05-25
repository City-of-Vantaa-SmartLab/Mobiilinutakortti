# Mobiilinutakortti frontend

The frontend directory includes the frontend side code for Mobiilinutakortti app.

Frontend is build using React (running on port 3000 by default).

## System Requirements:

- Node JS - v16

## Running locally

You need to have the backend running before starting the frontend; see `../backend/README.md` for info.

1. Run `npm install`
2. Run `npm run start` or `npm run dev`
    * since the default port 3000 is taken by backend already, if you wish you can set a new port for frontend to run in package.json: `"start": " PORT=3001 react-scripts start"`
    * npm will anyway suggest another port automatically, so modifying package.json is not required in any case
    * if you chose port 3001, you can see frontend running at [http://localhost:3001](http://localhost:3001)

The start script is the same as dev script, but you must set the required environment variable yourself with start.

## Environment variables / secrets

There's one environment variable:
* `REACT_APP_ENDPOINT`: the base API URL, e.g. "https://api.mobiilinuta-admin-test.com/api"
