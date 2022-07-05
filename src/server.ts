import express from "express";
import { createServer } from "http";
import path from 'path'
const app = express();
const server = createServer(app);
import { Server } from "socket.io"
import { ClientToServerEvents, EntityData, InterServerEvents, ServerToClientEvents, SocketData } from "./app/types";
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server);
//const socket = io.of('/game')

const objects: Record<string, EntityData> = {}



app.use(express.static(path.join(__dirname, '../dist')))

io.on('connection', (socket) => {

  setInterval(() => {
    console.log(objects)
    socket.emit('update', Object.values(objects));
  },500);
  
  console.log('a user connected');
  socket.on('disconnect', () => {
    if(Object.values(objects).length <=0){
      io.close()
    }
    console.log('user disconnected');
  });
  socket.on('playerJoined', (__id, player) => {
    console.log('Player joined: ', player.id)
    objects[player.id] = player
  });
  socket.on('playerMoved', (__id, player) => {
    //console.log('Player moved: ', id)
    objects[player.id] = player
  });
  
});



server.listen(process.env.PORT, () => {
  console.log("listening on *:3000");
});
