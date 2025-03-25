import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io();

export default function GameBoard() {
    const size = 15;
    const [board, setBoard] = useState(Array(size).fill(null).map(() => Array(size).fill(null)));
    const [turn, setTurn] = useState("black");
    const [playerColor, setPlayerColor] = useState(null);

    useEffect(() => {

        socket.on("assignColor", (color) => {
            setPlayerColor(color);
        });

        socket.on("spectator", () => {
            setPlayerColor("spectator");
        });

        socket.on("update", ({ row, col, player }) => {
            setBoard((prev) => {
                const newBoard = prev.map(row => [...row]);
                newBoard[row][col] = "placed"; // Hide color after placement
                return newBoard;
            });
            setTurn(player === "black" ? "white" : "black");
        });

        // Reconfirm player status after 3 seconds
        setTimeout(() => {
          if (playerColor == null) {
            socket.emit("requestColor");
          }
          //socket.emit("confirmTurn")
      }, 3000);

    }, []);

    const handleMove = (row, col) => {
        if (board[row][col] !== null || playerColor !== turn) return;
        socket.emit("move", { row, col, player: playerColor });
    };

    return (
        <div style={{ textAlign: "center" }}><h2>{playerColor === "spectator" ? "Spectator" : `You are playing as ${playerColor}`}</h2>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${size}, 30px)`, gap: "2px" }}>
                {board.map((row, rIdx) =>
                    row.map((cell, cIdx) => (
                        <div
                            key={`${rIdx}-${cIdx}`}
                            onClick={() => handleMove(rIdx, cIdx)}
                            style={{ width: 30, height: 30, border: "1px solid black", backgroundColor: cell ? "gray" : "white" }}
                        />
                    ))
                )}
            </div>
        </div>
    );
}