
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
        this.cameraAllowed = false
        this.micAllowed = false
        this.incomingRing = new window.Audio("https://proxy.notificationsounds.com/wake-up-tones/door-knock-478/download/file-69_door-knock-2.mp3");
        this.incomingRing.volume = 0.5;
        this.incomingRing.loop = true;
        this.outgoingRing = new window.Audio("https://proxy.notificationsounds.com/wake-up-tones/good-morning-502/download/file-sounds-727-good-morning.mp3")
        this.outgoingRing.volume = 0.5;
        this.outgoingRing.loop = true

        
    }

    checkPermission = (permissionName, callback) => {
        try {
        navigator.permissions.query(Object.assign({name: permissionName}))
        .then(function (permission) {
           if(permission.state==="denied") {
                callback(false)
           } else callback(true)
        });
        } catch (e) {
        }
    }

    getUserMedia = (constraints) => {
        console.log(navigator.mediaDevices)
        return navigator.mediaDevices.getUserMedia(constraints);
    }

    listen = async () => {

        await this.getUserMedia({ video: true, audio: true })

        setTimeout(() => {
            this.checkPermission("camera", permit=> {
                this.cameraAllowed = permit
            })
            this.checkPermission("microphone", permit=> {
                this.micAllowed = permit
            })
        }, 10)
        
        this.socket.on("make-call", this.onMakeCall)  // Call Receiver

        this.socket.on('webrtc_offer', this.onWebRtcOffer) // Call Sender

        this.socket.on('webrtc_answer', this.onWebRtcAnswer)
        
        this.socket.on('webrtc_ice_candidate', this.onWebRtcIceCandidate)
    }

    hangout = () => {
        this.onStateChange(null, true)
    }

    makeCall = async (socketId) => {
        this.outgoingRing.play()
        setTimeout(async() => {
            if(!this.cameraAllowed || !this.micAllowed) {
                this.outgoingRing.pause()
                return alert("You can't call! Please allow camera and microphone permissions!")
            }
            this.roomId = this.socket.socketId
            this.toSocketIds = [socketId]
            await this.initLocalStream()
            this.socket.emit("make-call", { roomId: this.roomId, toSocketIds: [socketId] })
            this.videoContainer.style.display = "block"

            setTimeout(() => {
                if(this.peerConnection===null) {
                    this.outgoingRing.pause()
                    this.onStateChange(null, true)
                }
            }, 20000)
        }, 10)
    }

    onMakeCall = async (data) => { // Call Receiver
        this.incomingRing.play();
        // const starTimer = Date.now()/1000
        setTimeout(async () => {
            const confirmResult = window.confirm("Incomming call from "+ data.roomId)
            if(confirmResult) {
                this.incomingRing.pause()
                if(!this.cameraAllowed || !this.micAllowed) {
                    return alert("You can't answer! Please allow camera and microphone permissions!")
                }
                // if(Date.now()/1000-starTimer)
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
            } else {
                this.incomingRing.pause()
            }
        }, 10)
    }

    onWebRtcOffer = async(data) => { // Call Sender 
        console.log('Socket event callback: webrtc_offer')
        this.outgoingRing.pause()
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
        if(forceClosed || (this.peerConnection && this.peerConnection.iceConnectionState==="disconnected")) {
            if(this.peerConnection)
                this.peerConnection.close()
            if(this.localStream)
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
                this.outgoingRing.pause()
                this.incomingRing.pause()
            }, 100)
        }
    }

}

export default TestVideoCall