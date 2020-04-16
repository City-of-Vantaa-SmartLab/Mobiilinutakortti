# Mobiilinutakortti frontend
    
    The frontend directory includes the frontend side code for Mobiilinutakortti app.
    
    Frontend is build using React (running on port 3001).
    
    ## System Requirements:
    
    - Node JS - v10
    
    ## Running locally
    
    1. Run `npm install` to get all frontend pacakges needed
    2. Before running frontend:
        * ../backend should be running *(see ../backend/README.md on how to get backend running)*
        * since the default port react app runs locally *(3000)* is taken by backend, you can set a new port for frontend to run in package.json. `"start": " PORT=3001 react-scripts start"`
    3. Run `npm run start` - and you can see frontend running at [http://localhost:3001](http://localhost:3001)