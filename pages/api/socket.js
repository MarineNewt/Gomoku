import { Server } from "socket.io";

export default function handler(req, res) {
    if (!res.socket.server.io) {
        const io = new Server(res.socket.server);
        res.socket.server.io = io;

        let players = {};
        let currentTurn = "black";
        let currentTurnNum = 0;

        function syncCheck(reportedTurn){
            if(reportedTurn !== currentTurnNum){
                io.emit("reset", "Desynced");
                currentTurnNum = 0;
                currentTurn = "black"
                console.log("Desynced")
            }
        }

        io.on("connection", (socket) => {
            ////On Connect
            console.log("a player connected")
            if (!players.black) {
                players.black = socket.id;
                socket.emit("assignColor", "black");
            } else if (!players.white) {
                players.white = socket.id;
                socket.emit("assignColor", "white");
            } else {
                socket.emit("spectator"); // More than 2 players become spectators
            }

            //On emit
            socket.on("move", ({ row, col, player }) => {
                if (players[player] === socket.id && player === currentTurn) {
                    currentTurn = currentTurn === "black" ? "white" : "black";
                    io.emit("update", { row, col, player });
                    currentTurnNum++;
                }
            });

            socket.on("disconnect", () => {
                console.log("a player disconnected")
                if (players.black === socket.id) delete players.black;
                if (players.white === socket.id) delete players.white;
            });

            socket.on("requestColor", ({ turnnum }) => {
                console.log(`${currentTurn} `)
                if (players.black == socket.id) {
                    socket.emit("assignColor", "black");
                    syncCheck(turnnum);
                } else if (players.white == socket.id) {
                    socket.emit("assignColor", "white");
                    syncCheck(turnnum);
                } else {
                    socket.emit("spectator");
                }
            });

        });
    }
    res.end();
}