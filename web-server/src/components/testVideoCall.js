
// signalingChannel.addEventListener('message', async message => {
//     if (message.offer) {
//         peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
//         const answer = await peerConnection.createAnswer();
//         await peerConnection.setLocalDescription(answer);
//         signalingChannel.send({'answer': answer});
//     }
// });

// try {
//     const stream = openMediaDevices({ 'video': true, 'audio': true });
//     console.log('Got MediaStream:', stream);
// } catch (error) {
//     console.error('Error accessing media devices.', error);
// }

const { RTCPeerConnection, RTCSessionDescription } = window

const config = {
	'iceServers': [
		{'urls': 'stun:stun.l.google.com:19302'},
		{"urls":"turn:numb.viagenie.ca", "username":"webrtc@live.com", "credential":"muazkh"}
	]
  };

class TestVideoCall {
    constructor(socket) {
        this.peerConnection = new RTCPeerConnection(config) 
        this.socket = socket
        this.callType = null
        console.log("constructor", this.peerConnection)

        

    }

    getUserMedia = (constraints) => {
        return navigator.mediaDevices.getUserMedia(constraints);
    }

    listen = async () => {
        console.log("listen")
        this.socket.on("offer", this.receiveCall)
        
        this.socket.on("req-call", d => {
            alert("Incoming call!")
            this.callType = "receiver"
            this.socket.emit("accept-call", { socketId: d.socketId})
        } )

        // const remoteStream = new MediaStream();
        // const remoteVideo = document.querySelector('#remote-video');
        // remoteVideo.srcObject = remoteStream;

        // this.peerConnection.addEventListener('track', async (event) => {
        //     console.log("track from sender!")
        //     remoteStream.addTrack(event.track, remoteStream);
        // });

        // this.peerConnection.onnegotiationneeded = () => {
        //     console.log("onnegotiationneeded: restartIce")
        //     this.peerConnection.restartIce()
        // }

        // setTimeout(async () => {
        //     try {
        //         console.log("Streaming")
        //         const localStream = await this.getUserMedia({video: true, audio: true});
        //         const localVideo = document.getElementById('local-video');
        //         localVideo.srcObject = localStream;
        //     } catch (error) {
        //         console.error(error)
        //     } 
        // }, 2000)

        // this.peerConnection.ontrack = function ({ streams: [stream] }) {
        //     console.log("track coming!")
        //     // remoteStream.addTrack(event.track, remoteStream);
        //     const remoteVideo = document.getElementById('remote-video');
        //     remoteVideo.srcObject = stream;
        // };

        // this.peerConnection.ontrack = function (e) {
        //     console.log("track coming!")
        //     // remoteStream.addTrack(event.track, remoteStream);
        //     const remoteVideo = document.getElementById('remote-video');
        //     remoteVideo.srcObject = e.streams[0];
        // };

        this.peerConnection.onicecandidate = function (e) {
            console.log("onicecandidate coming! ", e)
        };

        // this.peerConnection.onnegotiationneeded = function (e) {
        //     console.log("onnegotiationneeded coming! ", e)
        // };

    }

    makeCall = async (socketId) => {
        console.log("makeCall socketId: ", socketId)
        this.socket.emit("req-call", { socketId })
        this.callType = "caller"
        this.socket.on("accept-call", async data => {
            const offer = await this.peerConnection.createOffer()
            await this.peerConnection.setLocalDescription(offer)  
            this.socket.emit("offer", { socketId, offer }) 

            // this.peerConnection.onnegotiationneeded = async (e) => {
            //     console.log("onnegotiationneeded coming! ", e)

            //     const offer = await this.peerConnection.createOffer()
            //     await this.peerConnection.setLocalDescription(offer)
            // };

            this.socket.on("offer", async ({ socketId, offer })=> {
                const localStream = await this.getUserMedia({video: true, audio: true});
                const localVideo = document.getElementById('local-video');
                localVideo.srcObject = localStream;

                await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

                localStream.getTracks().forEach(track => {
                    console.log("local-track")
                    try {
                        this.peerConnection.addTrack(track, localStream);
                    } catch(error) {
                        console.error(error)
                    }
                });

                this.peerConnection.ontrack = function (e) {
                    console.log("track coming sender! ", e.streams[0])
                    // remoteStream.addTrack(event.track, remoteStream);
                    // const remoteVideo = document.getElementById('remote-video');
                    // remoteVideo.srcObject = e.streams[0];
                    document.getElementById('remote-video').srcObject = e.streams[0]
                };

                // const remoteStream = new MediaStream();
                // const remoteVideo = document.getElementById('remote-video');
                // remoteVideo.srcObject = remoteStream;

                // this.peerConnection.ontrack = function ({ streams: [stream] }) {
                //     console.log("track from receiver!")
                //     // remoteStream.addTrack(event.track, remoteStream);
                //     const remoteVideo = document.getElementById('remote-video');
                //     remoteVideo.srcObject = stream;
                // };
            })

            
        })
    }

    receiveCall = async({ socketId, offer}) => {
        if(this.callType!=="receiver") return;

        console.log("\nreceived call",socketId, this.socket.socketIoClient.id , this.peerConnection, offer)
        this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await this.peerConnection.createAnswer()
        await this.peerConnection.setLocalDescription(answer)
        this.socket.emit("offer", { socketId, offer:answer})

        const localStream = await this.getUserMedia({video: true, audio: true});
        const localVideo = document.getElementById('local-video');
        localVideo.srcObject = localStream;
        localStream.getTracks().forEach(track => {
            console.log("local-track ", track)
            this.peerConnection.addTrack(track, localStream);
        });

        this.peerConnection.ontrack = function (e) {
            console.log("track coming receiver! ", e.streams[0])
            // remoteStream.addTrack(event.track, remoteStream);
            // const remoteVideo = document.getElementById('remote-video');
            // remoteVideo.srcObject = e.streams[0];
            document.getElementById('remote-video').srcObject = e.streams[0]
        };

        // const remoteStream = new MediaStream();
        // const remoteVideo = document.getElementById('remote-video');
        // remoteVideo.srcObject = remoteStream;

        // this.peerConnection.ontrack = function ({ streams: [stream] }) {
        //     console.log("track from sender!")
        //     // remoteStream.addTrack(event.track, remoteStream);
        //     const remoteVideo = document.getElementById('remote-video');
        //     remoteVideo.srcObject = stream;
        // };

        // const remoteStream = new MediaStream();
        // const remoteVideo = document.querySelector('#remote-video');
        // remoteVideo.srcObject = remoteStream;

        // this.peerConnection.addEventListener('track', async (event) => {
        //     console.log("track from sender!")
        //     remoteStream.addTrack(event.track, remoteStream);
        // });

    }

}

export default TestVideoCall