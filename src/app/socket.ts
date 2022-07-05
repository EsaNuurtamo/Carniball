import { ServerToClientEvents, ClientToServerEvents } from './types'
import { io, Socket } from "socket.io-client";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io();

