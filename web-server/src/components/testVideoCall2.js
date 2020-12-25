
const { RTCPeerConnection, RTCSessionDescription } = window

const config = {
	'iceServers': [
		{'urls': 'stun:stun.l.google.com:19302'},
		{"urls":"turn:numb.viagenie.ca", "username":"webrtc@live.com", "credential":"muazkh"}
	]
  };

class TestVideoCall {
    constructor(socket) {
        this.peerConnection = null
        this.socket = socket
        this.roomId = null  
        this.toSocketIds = []
        this.localStream = null
        this.remoteStream = null   
        this.videoContainer = document.getElementById("video-container")
        this.localVideo = document.getElementById("local-video")
        this.remoteVideo = document.getElementById("remote-video")    
    }

    getUserMedia = (constraints) => {
        return navigator.mediaDevices.getUserMedia(constraints);
    }

    listen = async () => {
        console.log("listen")
        
        this.socket.on("make-call", this.onMakeCall)  // Call Receiver

        this.socket.on('webrtc_offer', this.onWebRtcOffer) // Call Sender

        this.socket.on('webrtc_answer', this.onWebRtcAnswer)
        
        this.socket.on('webrtc_ice_candidate', this.onWebRtcIceCandidate)
    }

    hangout = () => {
        this.onStateChange(null, true)
    }

    makeCall = async (socketId) => {
        console.log("makeCall socketId: ", socketId)
        this.roomId = this.socket.socketId
        this.toSocketIds = [socketId]
        await this.initLocalStream()
        this.socket.emit("make-call", { roomId: this.roomId, toSocketIds: [socketId] })
        this.videoContainer.style.display = "block"

        // setTimeout(() => {
        //     if(this.peerConnection===null) {
        //         this.onStateChange(null, true)
        //     }
        // }, 10000)
    }

    onMakeCall = async (data) => { // Call Receiver
        console.log("call receive")
        const confirmResult = window.confirm("Incomming call from "+ data.roomId)
        if(confirmResult) {
            const { roomId } = data
            await this.initLocalStream()
            this.roomId = roomId
            this.peerConnection = new RTCPeerConnection(config)
            this.addLocalTrack()
            this.peerConnection.ontrack = this.initRemoteStream
            this.peerConnection.onicecandidate = this.sendIceCandidate
            this.peerConnection.oniceconnectionstatechange = this.onStateChange
            await this.createOffer()
            this.videoContainer.style.display = "block"
        }
    }

    onWebRtcOffer = async(data) => { // Call Sender 
        console.log('Socket event callback: webrtc_offer')
        
        // if (!isRoomCreator) {
            this.peerConnection = new RTCPeerConnection(config)
            this.addLocalTrack(this.peerConnection)
            this.peerConnection.ontrack = this.initRemoteStream
            this.peerConnection.onicecandidate = this.sendIceCandidate
            this.peerConnection.oniceconnectionstatechange = this.onStateChange
            this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp))
            await this.createAnswer()

            this.videoContainer.style.display = "block"
        // }
    }

    onWebRtcAnswer = (data) => {
        console.log('Socket event callback: webrtc_answer')
      
        this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp))

        this.videoContainer.style.display = "block"
    }

    onWebRtcIceCandidate = (data) => {
        console.log('Socket event callback: webrtc_ice_candidate')
      
        // ICE candidate configuration.
        var candidate = new RTCIceCandidate({
          sdpMLineIndex: data.label,
          candidate: data.candidate,
        })
        this.peerConnection.addIceCandidate(candidate)
      }

    addLocalTrack = async () => {
        this.localStream.getTracks().forEach( t => {
            this.peerConnection.addTrack(t, this.localStream)
        })
    }

    initLocalStream = async () => {
        try {
            this.localStream = await this.getUserMedia({ video: true, audio: true })
            this.localVideo.srcObject = this.localStream
        } catch (error) {
            console.error('Could not get user media', error)
        }
    }

    initRemoteStream = async (event) => {
        console.log("on track - remote ...")
        try {
            this.remoteStream = event.streams[0]
            this.remoteVideo.srcObject = event.streams[0]
        } catch (error) {
            console.error('Could not get user media', error)
        }
    }

    sendIceCandidate = (event) => {
        if (event.candidate) {
          this.socket.emit('webrtc_ice_candidate', {
            roomId: this.roomId,
            label: event.candidate.sdpMLineIndex,
            candidate: event.candidate.candidate,
          })
        }
    }

    createOffer = async () => {
        let sessionDescription
        try {
          sessionDescription = await this.peerConnection.createOffer()
          this.peerConnection.setLocalDescription(sessionDescription)
        } catch (error) {
          console.error(error)
        }      
        this.socket.emit('webrtc_offer', {
          type: 'webrtc_offer',
          sdp: sessionDescription,
          roomId: this.roomId,
        })
    }

    createAnswer = async () => {
        let sessionDescription
        try {
          sessionDescription = await this.peerConnection.createAnswer()
          this.peerConnection.setLocalDescription(sessionDescription)
        } catch (error) {
          console.error(error)
        }
      
        this.socket.emit('webrtc_answer', {
          type: 'webrtc_answer',
          sdp: sessionDescription,
          roomId: this.roomId,
          toSocketIds: this.toSocketIds
        })
    }

    onStateChange = (event, forceClosed=false) => {
        // if(this.peerConnection) {
        //     console.log("stateChangeddd : ", this.peerConnection.iceConnectionState)
        // }
        if(forceClosed || (this.peerConnection && this.peerConnection.iceConnectionState==="disconnected")) {
            if(this.peerConnection)
                this.peerConnection.close()
            for(let t of this.localStream.getTracks()) t.stop()
            setTimeout(() => {
                this.videoContainer.style.display = "none"
                this.localVideo.srcObject = null
                this.remoteVideo.srcObject = null
                this.peerConnection = null
                this.roomId = null  
                this.toSocketIds = []
                this.localStream = null
                this.remoteStream = null 
                alert("Disconnected!")
            }, 100)
        }
    }

}

export default TestVideoCall