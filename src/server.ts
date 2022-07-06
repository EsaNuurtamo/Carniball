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

app.use(express.static(path.join(__dirname, '../dist')))
app.use(express.static(path.join(__dirname, '../assets')))

io.on('connection', (socket) => {

  //emit updated state from server every 500ms
  setInterval(() => {
    socket.emit('update', Object.values(objects));
  },1000/30);

  console.log('user connected');

  socket.on('disconnect', () => {
    if(Object.values(objects).length <=0){
      io.disconnectSockets(true)
    }
    console.log('user disconnected');
  });

  //when player joins add the player 
  socket.on('playerJoined', (player) => {
    console.log('Player joined: ', player.id)
    objects[player.id] = player
  });

  //when player moves update the position
  socket.on('playerMoved', (player) => {
    console.log(`Player ${player.id} moved: ${player.position}`)
    objects[player.id] = player
  });
});

server.listen(process.env.PORT, () => {
  console.log("listening on *:3000");
});
