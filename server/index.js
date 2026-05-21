const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const rooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);

    console.log(
      `User ${socket.id} joined room ${roomId}`
    );

    if (!rooms[roomId]) {
      rooms[roomId] = [];
    }

    if (!rooms[roomId].includes(socket.id)) {
      rooms[roomId].push(socket.id);
    }

    io.to(roomId).emit(
      'playerCount',
      rooms[roomId].length
    );
  });

  socket.on(
    'makeMove',
    ({
      roomId,
      board,
      currentPlayer,
      winner,
    }) => {
      socket.to(roomId).emit(
        'opponentMove',
        {
          board,
          currentPlayer,
          winner,
        }
      );
    }
  );

  socket.on('disconnect', () => {
    console.log(
      'User disconnected:',
      socket.id
    );

    for (const roomId in rooms) {
      rooms[roomId] =
        rooms[roomId].filter(
          (id) => id !== socket.id
        );

      io.to(roomId).emit(
        'playerCount',
        rooms[roomId].length
      );

      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
      }
    }
  });
});

server.listen(3001, () => {
  console.log(
    'Socket.io server running on http://localhost:3001'
  );
});