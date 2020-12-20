const socketIo = require("socket.io")
const SocketController = require("./socket.controller")

module.exports = class SocketServer {
    constructor(http, data) {
        this.users = data.users
        this.io = socketIo(http)
        this.events = data.events
        this.privateMessage = data.privateMessage

        this.socketController = new SocketController(this.io, this.events, {
            users: this.users, 
            privateMessage: this.privateMessage
        })
    }

    listen = () => {
        this.handleUserConnectDisConnect()
    }

    handleUserConnectDisConnect = () => {
        this.io.on("connection", socket => {
            const displayName = socket.handshake.query.displayName
            const newUser = {
                socketId: socket.id,
                displayName: displayName,
                avatarUrl: `/media/user-avatar-${Math.floor(Math.random()*10)+1}.png`
            }
            const alreadyJoinedUser = this.users.find(u => u.socketId === socket.id)
            if(!alreadyJoinedUser) {
                this.users.push(newUser)  
                console.log(displayName + "("+socket.id+")" + " is conneted. Total "+ (this.users.length) + " clients.") 
            }
            socket.emit(this.events.welcome, { myInfo: newUser })
            socket.emit(this.events.userListUpdated, { userList: this.users.filter(u => u.socketId !== socket.id) })
            socket.broadcast.emit(this.events.userListUpdated, { userList: this.users })
            // socket.broadcast.emit(this.events.newUserUpdated, { user: newUser })

            socket.on("disconnect", () => {
                console.log(displayName + "("+socket.id+")" + " is disconneted.")
                const userIndex = this.users.findIndex(u => u.socketId === socket.id)
                if(userIndex>=0) {
                    const currentUser = this.users[userIndex]
                    this.users.splice(userIndex, 1)
                    socket.broadcast.emit(this.events.userListUpdated, { userList: this.users })
                    // socket.broadcast.emit(this.events.removeUserUpdated, { user: currentUser })
                }
            })

            this.handleUserEvent(socket)
        })
    }

    handleUserEvent = socket => {
        socket.on(this.events.privateMessage, data => this.socketController.handlePrivateMessage(socket, data))

        // video test
        socket.on("req-call", data => {
            socket.to(data.socketId).emit("req-call", { socketId: socket.id })
        })
        socket.on("accept-call", data => {
            socket.to(data.socketId).emit("accept-call", { socketId: socket.id, answer: data.answer })
        })
        socket.on("offer", data => {
            socket.to(data.socketId).emit("offer", { socketId: socket.id, offer: data.offer })
        })

    }

}