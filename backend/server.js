import 'dotenv/config';
import { createServer } from 'http';

import app from './src/app.js';
import connectDB from './src/db/db.js';
import socketServer from './src/sockets/socket.server.js';

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);
socketServer(httpServer);

const startServer = async () => {
  try {
    await connectDB();
    
    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('DB Connection Failed:', error.message);
    process.exit(1);
  }
};

startServer();