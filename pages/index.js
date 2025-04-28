import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import GameBoard from "../components/gameBoard";
import Lobby from "../components/lobby"
import styles from "../styles/Home.module.css"

export default function Home() {
  const [socket, setSocket] = useState(null);
  const handleJoin = () => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '');
    setSocket(socket);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.gametitle}>Blind Gomoku</h1>
      {!socket && <Lobby joinLobby={handleJoin} />}
      {socket && <div className={styles.gameboard}><GameBoard socket={socket}/></div>}
    </div>
  );
}