import express from "express";
import { createServer } from "http";
import path from 'path'
import { Server } from "socket.io"
import { ClientToServerEvents, EntityData, InterServerEvents, ServerToClientEvents, SocketData } from "./app/types";
const app = express();
const server = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server);

//all game state is just the position of objects (players)
const objects: Record<string, EntityData> = {}
const playerBySocket: Record<string, EntityData> = {}

app.use(express.static(path.join(__dirname, '../dist')))
app.use(express.static(path.join(__dirname, '../assets')))

const emitQuit = (entity: EntityData) => io.emit('playerQuit', entity)

io.on('connection', (socket) => {

  //emit updated state from server every 500ms
  setInterval(() => {
    socket.emit('update', Object.values(objects));
  },1000/30);

  console.log('user connected to socket: ', socket.id);

  socket.on('disconnect', () => {
    // if(Object.values(objects).length <=0){
    //   io.disconnectSockets(true)
    // }
    const player = playerBySocket[socket.id]
    delete objects[player.id]
    emitQuit(player)
    console.log('User disconnected: ', player.id);
  });

  //when player joins add the player 
  socket.on('playerJoined', (player) => {
    console.log('Player joined: ', player.id)
    console.log('Socket: ', socket.id)
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
