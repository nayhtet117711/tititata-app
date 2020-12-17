const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const cors = require("cors")

const SocketServer = require("./socket.server")
const AppData = require("./app.data")

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use("/media", express.static(path.join(__dirname, "../", "assets")));

app.get("/ping", (req, res, next) => res.send("PONG") )

app.get("/events", (req, res, next) => res.json(AppData.events) )

app.get("/msg-priv", (req, res, next) => res.json(AppData.privateMessage) )

app.get("/users", (req, res, next) => res.json(AppData.users) )

const APP_PORT = process.env.PORT || 10101
const APP_NAME = "Titi-tata API Server"

const http = require("http").createServer(app)

module.exports.start = () => {
    http.listen(APP_PORT, error => {
        if(error) {
            console.log("FAIL TO START!")
            return console.error(error)
        }
        console.log(`${APP_NAME} is running on http://127.0.0.1:${APP_PORT}/.`)

        const socketServer = new SocketServer(http, AppData)
        socketServer.listen()
    })
}