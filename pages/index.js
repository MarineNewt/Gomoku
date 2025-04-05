import GameBoard from "../components/gameBoard";
import styles from "../styles/Home.module.css"

export default function Home() {
    return (
        <div className={styles.container}>
            <h1 className={styles.gametitle}>Blind Gomoku</h1>
            <div className={styles.gameboard}><GameBoard  /></div>
        </div>
    );
}