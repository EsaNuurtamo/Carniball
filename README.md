# Carniball
Carniball is a multiplayer game where you eat other balls and grow.

Techstack: Three.js, node.js, express, socket.io, typescript, parcel

## Starting the project in development mode
- `yarn install` - install dependencies
- `yarn develop` - watches for changes and starts up a local server
- `yarn watch` - on a seperate tab to bundle frontend with parcel when files are changed

## Building and deploying
The project is deployed to heroku. 

Install heroku CLI:
`brew install heroku`

Create heroku account and login with CLI:
`heroku login`

Ask me on slack and I'll give access to the project.

Add heroku as remote with the CLI:
`heroku git:remote -a carniball`

Push to heroku (I'll add automatic deployment to heroku from github's main branch)
`git push heroku main`
