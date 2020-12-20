
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

class TestVideoCall {
    constructor(socket) {
        this.peerConnection = new RTCPeerConnection() 
        this.socket = socket
        console.log("constructor", this.peerConnection)
    }

    async openMediaDevices(constraints) {
        return await navigator.mediaDevices.getUserMedia(constraints);
    }

    listen = () => {
        console.log("listen")
        this.socket.on("req-call", this.receiveCall)
    }

    makeCall = async (socketId) => {
        console.log("makeCall socketId: ", socketId)
        this.socket.emit("req-call", { socketId })
        this.socket.on("accept-call", async data => {
            const offer = await this.peerConnection.createOffer()
            await this.peerConnection.setLocalDescription(offer)  
            this.socket.emit("offer", { socketId, offer }) 

            const localStream = await this.getUserMedia({vide: true, audio: true});
            localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, localStream);
            });
        })
    }

    receiveCall = async({ socketId, offer}) => {
        console.log("received call", this.peerConnection )
        // const confirmation = 
        alert("Incoming call accept?")
        this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await this.peerConnection.createAnswer()
        await this.peerConnection.setLocalDescription(answer)
        this.socket.emit("accept-call", { socketId, answer})

        const remoteStream = MediaStream();
        const remoteVideo = document.querySelector('#remote-video');
        remoteVideo.srcObject = remoteStream;

    }

}

export default TestVideoCall