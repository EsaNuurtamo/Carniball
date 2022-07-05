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

io.on('connection', (socket) => {

  //emit updated state from server every 500ms
  setInterval(() => {
    console.log(objects)
    socket.emit('update', Object.values(objects));
  },500);

  console.log('user connected');

  socket.on('disconnect', () => {
    if(Object.values(objects).length <=0){
      io.close()
    }
    console.log('user disconnected');
  });

  //when player joins add the player 
  socket.on('playerJoined', (__id, player) => {
    console.log('Player joined: ', player.id)
    objects[player.id] = player
  });

  //when player moves update the position
  socket.on('playerMoved', (__id, player) => {
    //console.log('Player moved: ', id)
    objects[player.id] = player
  });
});

server.listen(process.env.PORT, () => {
  console.log("listening on *:3000");
});
