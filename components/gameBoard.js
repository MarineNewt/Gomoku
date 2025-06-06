import { useState, useEffect, useRef } from "react";
import styles from "../styles/Home.module.css"
import loadingicon from '/public/images/Moving blocks.gif'
import turnicon from '/public/images/Goturn.png'

export default function GameBoard({socket}) {
    let size = 15;
    let [board, setBoard] = useState(Array(size).fill(null).map(() => Array(size).fill(null)));
    let [turn, setTurn] = useState("Black");
    let [turnnum, incTurn] = useState(0);
    let [playerColor, setPlayerColor] = useState("");
    let playerColorRef = useRef("");
    let [winner, setWinner] = useState(null);
    let [lastBlock, setLastBlock] = useState(null);
    let [loading, setLoading] = useState(true);
    
    useEffect(() => {
      playerColorRef.current = playerColor;

      socket.on("assignColor", (color) => {
          setPlayerColor(color);
          console.log("Assigned")
          playerColorRef.current = playerColor;
      });

      socket.on("spectator", () => {
          setPlayerColor("spectator");
      });

      socket.on("loaded", (loaded) => {
        setLoading(!loaded);
      });

      socket.on("reset", (message) => {
        setBoard(Array(size).fill(null).map(() => Array(size).fill(null)));
        setTurn("Black");
        incTurn(0);
        console.log(message);
      });

      socket.on("update", ({ row, col, player }) => {
        setBoard((prev) => {
            let newBoard = prev.map(row => [...row]);
            newBoard[row][col] = player;
            if (checkWin(row, col, player, newBoard)) {
              setWinner(player);
            }
            return newBoard;
        });
        setLastBlock([row, col]);
        //check win conditions
        setTurn(player === "Black" ? "White" : "Black");
        incTurn(turnnum + 1);
      });

      // Reconfirm player status after 2 seconds
      setTimeout(() => {
        console.log(playerColorRef.current)
        if (playerColorRef.current === "") {
          console.log("request")
          socket.emit("requestColor", { turnnum });
        }
      }, 2000);

    }, [playerColor]);

    const countConsecutive = (row, col, rowDir, colDir, player, sboard) => {
      let count = 0;
      let r = row + rowDir;
      let c = col + colDir;

      while (r >= 0 && r < size && c >= 0 && c < size && sboard[r][c] === player) {
          count++;
          r += rowDir;
          c += colDir;
      }

      return count;
    };
    const checkWin = (row, col, player, sboard) => {
      return (
          countConsecutive(row, col, 1, 0, player, sboard) + countConsecutive(row, col, -1, 0, player, sboard) >= 4 || // Horizontal
          countConsecutive(row, col, 0, 1, player, sboard) + countConsecutive(row, col, 0, -1, player, sboard) >= 4 || // Vertical
          countConsecutive(row, col, 1, 1, player, sboard) + countConsecutive(row, col, -1, -1, player, sboard) >= 4 || // Diagonal (\)
          countConsecutive(row, col, 1, -1, player, sboard) + countConsecutive(row, col, -1, 1, player, sboard) >= 4    // Diagonal (/)
      );
    };
    const handleMove = (row, col) => {
        if (board[row][col] !== null || playerColor !== turn || winner) return;
        socket.emit("move", { row, col, player: playerColor });
    };

    return (
        <div style={{ textAlign: "center" }}><h2>{playerColor === "spectator" ? "Spectator" : `You are playing as ${playerColor}.`}</h2>
            {winner && <h1> {winner} Wins!</h1>}
            {loading && <div className={styles.loading}><img className={styles.loadingicon} src={loadingicon.src} alt="Design"/><h3 className={styles.loadingtext}>Awaiting players...</h3></div>}
            {!loading && !winner && (turn == playerColor) &&<div className={styles.turnContainer}><img className={styles.turnicon} src={turnicon.src} alt="Design"/></div>}
            <div className={styles.boardrow} style={{ }}>
                {board.map((row, rIdx) =>
                    row.map((cell, cIdx) => (
                        <div
                            className={styles.boardSquare}
                            key={`${rIdx}-${cIdx}`}
                            onClick={() => {handleMove(rIdx, cIdx);}}
                            style={{backgroundColor: cell ? (winner? (cell=="White" ? "white" : "black") : (rIdx == lastBlock[0]&&cIdx == lastBlock[1])? "blue" : "gray") : "rgb(226,210,182)" }}
                        />
                    ))
                )}
            </div>
        </div>
    );
}