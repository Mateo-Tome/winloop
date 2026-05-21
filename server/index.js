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

  console.log(
    'User connected:',
    socket.id
  );

  socket.on(
    'joinRoom',
    (roomId) => {

      if (!rooms[roomId]) {

        rooms[roomId] = {
          players: [],
        };

      }

      const room =
        rooms[roomId];

      const alreadyJoined =
        room.players.includes(
          socket.id
        );

      if (
        !alreadyJoined &&
        room.players.length >= 2
      ) {

        socket.emit(
          'roomFull'
        );

        return;

      }

      if (
        !alreadyJoined
      ) {

        room.players.push(
          socket.id
        );

      }

      socket.join(
        roomId
      );

      let assignedColor =
        null;

      if (
        room.players[0]
        ===
        socket.id
      ) {

        assignedColor =
          'red';

      }

      if (
        room.players[1]
        ===
        socket.id
      ) {

        assignedColor =
          'yellow';

      }

      socket.emit(
        'assignedColor',
        assignedColor
      );

      io.to(roomId).emit(
        'playerCount',
        room.players.length
      );

      console.log(
        socket.id,
        'joined',
        roomId,
        assignedColor
      );

    }
  );

  socket.on(
    'makeMove',
    ({
      roomId,
      board,
      currentPlayer,
      winner,
    }) => {

      socket.to(
        roomId
      ).emit(
        'opponentMove',
        {
          board,
          currentPlayer,
          winner,
        }
      );

    }
  );

  socket.on(
    'disconnect',
    () => {

      console.log(
        'Disconnected:',
        socket.id
      );

      for (
        const roomId
        in rooms
      ) {

        const room =
          rooms[roomId];

        room.players =
          room.players.filter(
            (id) =>
              id !==
              socket.id
          );

        io.to(roomId).emit(
          'playerCount',
          room.players.length
        );

        if (
          room.players
            .length === 0
        ) {

          delete rooms[
            roomId
          ];

        }

      }

    }
  );

});

server.listen(
  3001,
  () => {

    console.log(
      'Socket.io server running on http://localhost:3001'
    );

  }
);