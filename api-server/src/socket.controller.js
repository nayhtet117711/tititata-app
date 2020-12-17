module.exports = class SocketController {
    constructor(io, events, data) {
        this.io = io
        this.events = events
        this.users = data.users
        this.privateMessage = data.privateMessage
    }

    handlePrivateMessage = (socket, data) => {
        const { toSocketId, text } = data
        const privMsgId1 = `${socket.id}:${toSocketId}`
        const privMsgId2 = `${toSocketId}:${socket.id}`
        console.log("Message Receive: ", data)
        const privMsgId = Object.keys(this.privateMessage).includes(privMsgId1)  
            ? privMsgId1 
            : Object.keys(this.privateMessage).includes(privMsgId2)
                ? privMsgId2
                : null
        
        const msgData = {
            from: socket.id,
            to: toSocketId,
            text: text,
            ts: Date.now()
        }
        if(privMsgId) this.privateMessage[privMsgId].push(msgData) 
        else this.privateMessage[privMsgId1] = [msgData]

        socket.to(toSocketId).emit(this.events.privateMessage, msgData)
        socket.emit(this.events.privateMessage, msgData)
    }

}