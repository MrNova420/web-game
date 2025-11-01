import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
  });
  
  socket.on('player:move', (data) => {
    socket.broadcast.emit('player:update', {
      id: socket.id,
      ...data
    });
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
