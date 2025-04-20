const express = require("express")
const socket = require("socket.io")
const { Chess } = require("chess.js")
const http = require("http")
const path = require("path")

const app = express()

const server = http.createServer(app) //this scoket is the backend socket
const io = socket(server)

const chess = new Chess()

let players = {}
let currentPlayer = "w"

app.set("view engine", "ejs")
app.use(express.static(path.join(__dirname, "public")))

app.get("/", (req, res) => {
    res.render("index")
})

io.on("connection", (uniquesocket) => {   //here "uniquescoket" is the unique information of the user that has jst connected/visted to our site using the url
    console.log("Connected");

    uniquesocket.on("churan", () => {
        console.log("churan recieved");
    })

    if (!players.white) {
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole", "w")
    } else if (!players.black) {
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole", "b")
    } else {
        uniquesocket.emit("playerRole", "Spectator")
    }

    uniquesocket.on("disconnect", () => {
        if(uniquesocket.id === players.white) {
            delete players.black
        } else if (uniquesocket.id === players.black) {
            delete players.white
        }
    })

    uniquesocket.on("move", (move) => {
        try {
            if(chess.turn() === "w" && uniquesocket.id !== players.white) return
            if(chess.turn() === "b" && uniquesocket.id !== players.black) return

            const result = chess.move(move)
            if(result){
                currentPlayer = chess.turn()
                io.emit("move", move)
                io.emit("boardState", chess.fen())
            } else {
                console.log("invalid move : ", move);
                uniquesocket.emit("invalidMove", move)
            }
        } catch (err) {
            console.log(err);
            uniquesocket.emit("Invalid move: ", move)
        }
    })
})

server.listen(3000, () => {
    console.log("listening on port 3000");
})