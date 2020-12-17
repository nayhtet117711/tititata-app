import {io} from "socket.io-client"

const SOCKET_SERVER = "http://192.168.100.59:10101/"

class SocketClient {
    constructor() {
        this.socketId = null
        this.socketIoClient = null
    }

    doConnect = (displayName) => {
        this.socketIoClient = io(SOCKET_SERVER, {
            transports: ['websocket'],
            withCredentials: false,
            reconnectionDelayMax: 1800,
            query: {
                displayName: displayName
            }
        })
        this.socketIoClient.on("connect", () => {
            console.log("Connected ", this.socketIoClient.id)
        })
        this.socketIoClient.on("connect_error", error => {
            console.log("Connect-ERROR .....", error)
        })
    }

    doDisconnect = () => {
        this.socketIoClient.disconnect()
    }

    showInfo() {
        console.log(this.socketIoClient)
    }

    onConnect(callback) {
        this.socketIoClient.on("connect", () => {
            this.socketId = this.socketIoClient.id
            callback(this.socketId)
        })
    }

    onReady(callback) {
        
    }

    on(event, callback) {
        this.socketIoClient.on(event, callback)
    }

    emit(event, data) {
        this.socketIoClient.emit(event, data)
    }
}

const socketIoClientInstance = new SocketClient()

export default socketIoClientInstance