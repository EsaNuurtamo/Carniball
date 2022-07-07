import express from "express";
import { createServer } from "http";
import path from "path";
import { Server } from "socket.io";
import {
  ClientToServerEvents,
  EntityData,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./app/types";
const app = express();
const server = createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server);

//serve static html and js files
app.use(express.static(path.join(__dirname, "../dist")));
//serve assets like textures
app.use(express.static(path.join(__dirname, "../assets")));

//all game state kept here
const players: Record<string, EntityData> = {};

//player quit event
const emitQuit = (entity: EntityData) => io.emit("playerQuit", entity);
//emit updated state from server every 500ms

const gameInfo = {
  isRunning: false,
  updateInterval: 1000 / 30,
};

const stateUpdateLoop = () => {
  gameInfo.isRunning = true;

  // Reduce usage by only send state update if state has changed
  io.emit("update", Object.values(players));

  //only emit the state if there is players left
  if (Object.values(players).length > 0) {
    setTimeout(stateUpdateLoop, gameInfo.updateInterval);
  } else {
    // Stop the loop if there are no players left
    gameInfo.isRunning = false;
  }
};

io.on("connection", (socket) => {
  console.log("user connected to socket: ", socket.id);

  //when player disconnects get the player by socket id and emit event to clients so that the player is removed
  socket.on("disconnect", () => {
    const player = players[socket.id];
    if (!player) {
      console.warn("Socket disconnected that did not have any player.");
      return;
    }
    console.log(players);
    console.log("User disconnected: ", player.id);
    emitQuit(player);
    delete players[socket.id];
  });

  //when player joins add the player and map his socket id
  socket.on("playerJoined", (player) => {
    console.log("Player joined: ", player.id);
    players[socket.id] = player;
    if (!gameInfo.isRunning) {
      stateUpdateLoop();
    }
  });

  //when player moves update the position
  socket.on("playerMoved", (player) => {
    console.log("Player moved: ", player.id);
    players[player.id] = player;
  });
});

server.listen(process.env.PORT, () => {
  console.log("listening on *:3000");
});
