import React, {
  useEffect,
  useState,
} from 'react';

import io from 'socket.io-client';

const socket =
  io('http://localhost:3001');

const ROOM_ID =
  'test-room';

export default function Connect4Board(
  { onRestart }
) {

  const rows = 6;
  const columns = 7;

  const [board, setBoard] =
    useState(
      Array.from(
        { length: rows },
        () =>
          Array(columns)
            .fill(null)
      )
    );

  const [
    currentPlayer,
    setCurrentPlayer,
  ] = useState('red');

  const [
    myColor,
    setMyColor,
  ] = useState(null);

  const [
    winner,
    setWinner,
  ] = useState(null);

  const [
    playerCount,
    setPlayerCount,
  ] = useState(0);

  useEffect(() => {

    function handleConnect() {

      console.log(
        'Connected:',
        socket.id
      );

      socket.emit(
        'joinRoom',
        ROOM_ID
      );

    }

    function handleAssignedColor(
      color
    ) {

      console.log(
        'Assigned:',
        color
      );

      setMyColor(
        color
      );

    }

    function handlePlayerCount(
      count
    ) {

      setPlayerCount(
        count
      );

    }

    function handleRoomFull() {

      alert(
        'Room full'
      );

    }

    function handleOpponentMove({
      board,
      currentPlayer,
      winner,
    }) {

      setBoard(
        board
      );

      setCurrentPlayer(
        currentPlayer
      );

      setWinner(
        winner
      );

    }

    socket.on(
      'connect',
      handleConnect
    );

    socket.on(
      'assignedColor',
      handleAssignedColor
    );

    socket.on(
      'playerCount',
      handlePlayerCount
    );

    socket.on(
      'roomFull',
      handleRoomFull
    );

    socket.on(
      'opponentMove',
      handleOpponentMove
    );

    if (
      socket.connected
    ) {

      socket.emit(
        'joinRoom',
        ROOM_ID
      );

    }

    return () => {

      socket.off(
        'connect',
        handleConnect
      );

      socket.off(
        'assignedColor',
        handleAssignedColor
      );

      socket.off(
        'playerCount',
        handlePlayerCount
      );

      socket.off(
        'roomFull',
        handleRoomFull
      );

      socket.off(
        'opponentMove',
        handleOpponentMove
      );

    };

  }, []);

  function checkWinner(
    boardCheck
  ) {

    const dirs = [

      [0,1],
      [1,0],
      [1,1],
      [1,-1],

    ];

    for (
      let r=0;
      r<rows;
      r++
    ) {

      for (
        let c=0;
        c<columns;
        c++
      ) {

        const player =
          boardCheck[r][c];

        if (!player)
          continue;

        for (
          const [dx,dy]
          of dirs
        ) {

          let count=1;

          for (
            let step=1;
            step<4;
            step++
          ) {

            const nr =
              r +
              dx *
              step;

            const nc =
              c +
              dy *
              step;

            if (

              nr<0 ||
              nr>=rows ||
              nc<0 ||
              nc>=columns ||

              boardCheck
              [nr][nc]
              !== player

            ) {

              break;

            }

            count++;

          }

          if (
            count===4
          ) {

            return player;

          }

        }

      }

    }

    return null;

  }

  function handleClick(
    colIndex
  ) {

    if (
      winner
    ) return;

    if (

      myColor !==
      currentPlayer

    ) return;

    for (

      let row=
      rows-1;

      row>=0;

      row--

    ) {

      if (

        !board[row]
        [colIndex]

      ) {

        const updated=
          board.map(
            r=>[...r]
          );

        updated
        [row]
        [colIndex]
          =
          currentPlayer;

        const foundWinner=
          checkWinner(
            updated
          );

        const nextPlayer=

          currentPlayer
          ===
          'red'

          ?

          'yellow'

          :

          'red';

        setBoard(
          updated
        );

        setWinner(
          foundWinner
        );

        setCurrentPlayer(

          foundWinner

          ?

          currentPlayer

          :

          nextPlayer

        );

        socket.emit(
          'makeMove',
          {

            roomId:
              ROOM_ID,

            board:
              updated,

            currentPlayer:

              foundWinner

              ?

              currentPlayer

              :

              nextPlayer,

            winner:
              foundWinner,

          }
        );

        break;

      }

    }

  }

  return (

    <>

      <div>

        Players:
        {' '}
        {playerCount}

      </div>

      <div>

        You:
        {' '}
        {myColor ??
        'Waiting'}

      </div>

      <div>

        Turn:
        {' '}
        {currentPlayer}

      </div>

      {winner && (

        <h2>

          {winner}
          {' '}
          wins

        </h2>

      )}

      <div
        style={{
          display:
            'inline-block',
        }}
      >

        {board.map(
          (row,r)=>(

            <div
              key={r}
              style={{
                display:
                  'flex',
              }}
            >

              {row.map(
                (cell,c)=>(

                  <button

                    key={c}

                    onClick={()=>
                      handleClick(
                        c
                      )
                    }

                    style={{

                      width:70,
                      height:70,

                      margin:4,

                      borderRadius:
                        '50%',

                      background:

                        cell
                        ===
                        'red'

                        ?

                        'red'

                        :

                        cell
                        ===
                        'yellow'

                        ?

                        'gold'

                        :

                        '#0f4c81',

                    }}

                  />

                )
              )}

            </div>

          )
        )}

      </div>

    </>

  );

}