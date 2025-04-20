document.addEventListener("DOMContentLoaded", () => {
    const socket = io() // this line runs on frontend as this page is connceted to frontend and this line will send a request to backend socket therefore connecting both the sockets from backend to frontend hence every move will be connected/updated in real time
    socket.emit("churan") // an example of how it'll emit

    const chess = new Chess()
    const boardElement = document.querySelector("#chessboard")

    let draggedPiece = null
    let sourceSquare = null
    let playerRole = null

    const renderBoard = () => {
        const board = chess.board()
        boardElement.innerHTML = ""
        board.forEach((row, rowindex) => {
            row.forEach((square, squraeindex) => {
            const squareElement = document.createElement("div")
            squareElement.classList.add(
                "square", 
                (rowindex + squraeindex) % 2 === 0 ? "light" : "dark"
            )
            squareElement.dataset.row = rowindex
            squareElement.dataset.col = squraeindex

            if(square){
                const pieceElement = document.createElement("div")
                pieceElement.classList.add(
                    "piece",
                    square.color === 'w' ? "white" : "black"
                )
                pieceElement.innerText = getPieceUniCode(square)
                pieceElement.draggable = (playerRole === square.color)

                pieceElement.addEventListener("dragstart", (e) => {
                    if(pieceElement.draggable){
                        draggedPiece = pieceElement
                        sourceSquare = { row: rowindex, col: squraeindex }
                        e.dataTransfer.setData("text/plain", "")
                    }
                })

                pieceElement.addEventListener("dragend", () => {
                    draggedPiece = null;
                    sourceSquare = null;
                })

                squareElement.appendChild(pieceElement)
            }

            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault()
            })

            squareElement.addEventListener("drop", (e) => {
                e.preventDefault()
                if(draggedPiece){
                    const targetSource = {
                        row : parseInt(squareElement.dataset.row),
                        col : parseInt(squareElement.dataset.col)
                    }

                    handelMove(sourceSquare, targetSource)
                }
            })
            boardElement.appendChild(squareElement)
            })
        })

        if(playerRole === 'b'){
            boardElement.classList.add("flipped")
        } else {
            boardElement.classList.remove("flipped")
        }
    }

    const handelMove = (source, target) => {
        const move = {
            from: `${String.fromCharCode(source.col + 97)}${8 - source.row}`,
            to: `${String.fromCharCode(target.col + 97)}${8 - target.row}`,
            promotion: "q"
        }

        socket.emit("move", move)
    }

    const getPieceUniCode = (piece) => {
        const unicodePieces = {
            p: "♟", // black pawn
            r: "♜", // black rook
            n: "♞", // black knight
            b: "♝", // black bishop
            q: "♛", // black queen
            k: "♚", // black king
            P: "♙", // white pawn
            R: "♖", // white rook
            N: "♘", // white knight
            B: "♗", // white bishop
            Q: "♕", // white queen
            K: "♔"  // white king
        }
        
        return unicodePieces[piece.type] || ""
    }

    socket.on("playerRole", (role) => {
        playerRole = role
        renderBoard()
    })

    socket.on("spectatorRole", () => {
        spectatorRole = null
        renderBoard()
    })

    socket.on("boardState", (fen) => {
        chess.load(fen)
        renderBoard()
    })

    socket.on("move", (move) => {
        chess.load(move)
        renderBoard()
    })

    renderBoard()
})
