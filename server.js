const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

let players = {};
let currentTurn = "Black";
let currentTurnNum = 0;

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    cors: {
      origin: "*", // or specific domain
      methods: ["GET", "POST"]
    }
  });

  function syncCheck(reportedTurn){
    console.log(`sync report: ${reportedTurn}`)
    console.log(`sync server: ${currentTurnNum}`)
    if(reportedTurn !== currentTurnNum){
        io.emit("reset", "Desynced");
        currentTurnNum = 0;
        currentTurn = "Black"
        console.log("Desynced")
    }
    if(players.Black && players.White){
      console.log("LOADED")
      io.emit("loaded", true);
    }
  }

  io.on("connection", (socket) => {
    ////On Connect
    console.log(`A user connected: ${socket.id}`);
    console.log(`turn: ${currentTurnNum}`);
    if (!players.Black) {
      console.log("Initiate BLACK")
      players.Black = socket.id;
      syncCheck(0);
      socket.emit("assignColor", "Black");
    } else if (!players.White) {
      console.log("Initiate WHITE")
      players.White = socket.id;
      syncCheck(0);
      socket.emit("assignColor", "White");
    } else {
      console.log("LAPSE SPEC")
      socket.emit("spectator");
    }

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

    socket.on("move", ({ row, col, player }) => {
      if (players[player] === socket.id && player === currentTurn) {
        currentTurn = currentTurn === "Black" ? "White" : "Black";
        io.emit("update", { row, col, player });
        currentTurnNum++;
      }
    });

    socket.on("disconnect", () => {
      if (players.Black === socket.id) {
        delete players.Black;
        io.emit("loaded", false);
      } else if (players.White === socket.id) {
        delete players.White;
        io.emit("loaded", false);
      }
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
});
