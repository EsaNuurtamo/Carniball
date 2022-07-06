# Carniball
Carniball is a multiplayer game where you eat other balls and grow.

Techstack: Three.js, node.js, express, socket.io, typescript, parcel

## Starting the project in development mode
- `yarn install` - install dependencies
- `yarn develop` - watches for changes and starts up a local server
- `yarn watch` - on a seperate tab to bundle frontend with parcel when files are changed

## Building and deploying
Now master branch is automatically pushed to heroku when PR is merged. But you can read here how easy it is to deploy to heroku.

Install heroku CLI:
`brew install heroku`

Create heroku account and login with CLI:
`heroku login`

Ask me on slack and I'll give access to the project.

Add heroku as remote with the CLI:
`heroku git:remote -a carniball`

Push to heroku (I'll add automatic deployment to heroku from github's main branch)
`git push heroku main`

Heroku has node environment so you only have to have `build` and `start` scripts configured and it will also install all dependencies.
