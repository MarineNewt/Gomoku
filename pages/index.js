import GameBoard from "../components/gameBoard";

export default function Home() {
    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>Blind Gomoku</h1>
            <GameBoard />
        </div>
    );
}