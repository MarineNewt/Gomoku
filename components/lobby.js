import { useState, useEffect } from "react";
import styles from "../styles/Home.module.css"

export default function Lobby({ joinLobby }) {

  return (
    <div className={styles.lobbyContainer}>
      <h1 className={styles.lobbyTitle}>Welcome.</h1>
      <button onClick={joinLobby} className={styles.lobbyTile}>
        Join Lobby
      </button>
    </div>
  );
}
