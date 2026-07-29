import dotenv from 'dotenv';
dotenv.config();
import app from "./src/app.js";
import connectDB from './src/db/db.js';
import socketServer from './src/sockets/socket.server.js';
import { createServer } from "http";
const httpServer = createServer(app);

connectDB();
socketServer(httpServer);


httpServer.listen(process.env.PORT ,()=>{
    console.log("Server is runing on port 3000");
})