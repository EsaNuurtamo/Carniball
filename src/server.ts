import express from "express";
import { createServer } from "http";
import path from 'path'
import { Server } from "socket.io"
import { ClientToServerEvents, EntityData, InterServerEvents, ServerToClientEvents, SocketData } from "./app/types";
const app = express();
const server = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server);

//all game state kept here
const objects: Record<string, EntityData> = {}

const playerBySocket: Record<string, EntityData> = {}

//serve static html and js files
app.use(express.static(path.join(__dirname, '../dist')))

//serve assets like textures
app.use(express.static(path.join(__dirname, '../assets')))

//player quit event
const emitQuit = (entity: EntityData) => io.emit('playerQuit', entity)

io.on('connection', (socket) => {

  //emit updated state from server every 500ms
  setInterval(() => {
    socket.emit('update', Object.values(objects));
  },1000/30);

  console.log('user connected to socket: ', socket.id);

  //when player disconnects get the player by socket id and emit event to clients so that the player is removed
  socket.on('disconnect', () => {
    const player = playerBySocket[socket.id]
    console.log('User disconnected: ', player?.id);
    if(player)delete objects[player.id]
    delete playerBySocket[socket.id]
    emitQuit(player)
    if(Object.values(objects).length <=0){
      io.disconnectSockets(true)
    }
  });

  //when player joins add the player and map his socket id
  socket.on('playerJoined', (player) => {
    console.log('Player joined: ', player.id)
    objects[player.id] = player
    playerBySocket[socket.id] = player
  });

  //when player moves update the position
  socket.on('playerMoved', (player) => {
    //console.debug(`Player ${player.id} moved: ${player.position}`)
    objects[player.id] = player
  });
});

server.listen(process.env.PORT, () => {
  console.log("listening on *:3000");
});
