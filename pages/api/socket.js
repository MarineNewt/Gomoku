import { Server } from "socket.io";

export default function handler(req, res) {
    if (!res.socket.server.io) {
        const io = new Server(res.socket.server);
        res.socket.server.io = io;

        let players = {};
        let currentTurn = "Black";
        let currentTurnNum = 0;

        function syncCheck(reportedTurn){
            if(reportedTurn !== currentTurnNum){
                io.emit("reset", "Desynced");
                currentTurnNum = 0;
                currentTurn = "Black"
                console.log("Desynced")
            }
        }

        io.on("connection", (socket) => {
            ////On Connect
            console.log("a player connected")
            if (!players.Black) {
                players.Black = socket.id;
                socket.emit("assignColor", "Black");
            } else if (!players.White) {
                players.White = socket.id;
                socket.emit("assignColor", "White");
            } else {
                socket.emit("spectator"); // More than 2 players become spectators
            }

            //On emit
            socket.on("move", ({ row, col, player }) => {
                if (players[player] === socket.id && player === currentTurn) {
                    currentTurn = currentTurn === "Black" ? "White" : "Black";
                    io.emit("update", { row, col, player });
                    currentTurnNum++;
                }
            });

            socket.on("disconnect", () => {
                console.log("a player disconnected")
                if (players.Black === socket.id) delete players.Black;
                if (players.White === socket.id) delete players.White;
            });

            socket.on("requestColor", ({ turnnum }) => {
                if (players.Black == socket.id) {
                    socket.emit("assignColor", "Black");
                    syncCheck(turnnum);
                } else if (players.White == socket.id) {
                    socket.emit("assignColor", "White");
                    syncCheck(turnnum);
                } else {
                    socket.emit("spectator");
                }
            });

        });
    }
    res.end();
}