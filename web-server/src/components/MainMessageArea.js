import React, { Component, useState } from "react"
import PerfectScrollbar from 'react-perfect-scrollbar'
import { withRouter } from "react-router-dom"
import { connect } from "react-redux";
import { setSelectedUser } from "../redux/actions"
import config from "../config"
import socket from "../socketClient"

class MainMessageArea extends Component {
	constructor(props) {
		super(props)
		this.scrollRef = React.createRef(null)
		this.state = {
			messages: []
		}
	}

	componentDidMount() {	
		if(this.scrollRef) 
			this.scrollRef.scrollTop = this.scrollRef.scrollHeight
		if(!this.props.selectedUser && this.props.match.params.userId) {
			if(!this.props.activeUsers || this.props.activeUsers.length===0 || !this.props.activeUsers.find(u => u.socketId===this.props.match.params.userId)) 
				return this.props.history.replace({ pathname: "/" })
			else {
				this.props.setSelectedUser(this.props.activeUsers.find(u => u.socketId===this.props.match.params.userId))
			}
		} 
		setTimeout(this.listening, 10)
	}

	listening = () => {
		socket.on("priv-msg", data => {
			// console.log("priv-msg: ", data)
			if(data.from===this.props.myInfo.socketId) {
				this.setState(prev=> ({ messages: [...prev.messages, {...data, type: "sent"}] }))
				// const audio = new window.Audio("https://proxy.notificationsounds.com/notification-sounds/clearly-602/download/file-sounds-1143-clearly.mp3");
				// audio.volume = 0.1;
				// audio.play();
			} else if(data.to===this.props.myInfo.socketId) {
				this.setState(prev=> ({ messages: [...prev.messages, {...data, type: "received"}] }))
				const audio = new window.Audio("https://proxy.notificationsounds.com/message-tones/pristine-609/download/file-sounds-1150-pristine.mp3");
				audio.volume = 0.5;
				audio.play();
			}
		})
	}

	componentDidUpdate(prevProps) {
		if(prevProps.match.params.userId !== this.props.match.params.userId) {
			if(this.scrollRef) 
				this.scrollRef.scrollTop = this.scrollRef.scrollHeight
		}
	}

	handleSendMessage = (text) => {
		if(!text || text.trim()==="") return;
		// console.log("Handle Send Message: ", text)
		socket.emit("priv-msg", { text, toSocketId: this.props.selectedUser.socketId })
	}

	render() {

		const MessageListView = this.state.messages
			.filter(v => v.from===this.props.selectedUser.socketId || v.to===this.props.selectedUser.socketId)
			.map((v, i) => v.type==="sent" ? <MessageSentBox key={i} data={v} /> : <MessageReceivedBox key={i} data={v} /> )
		return (
			<div className={"" + this.props.className} style={{ ...this.props.style}}>
				<div className="d-flex align-items-center bg-light" style={{ height: 60, boxShadow: "0rem 0.065rem 0.12rem lightgray", marginBottom: 1 }}>
					{ this.props.selectedUser && <Header selectedUser={this.props.selectedUser} /> }
				</div>
				<div className="" style={{ height: this.props.page.height-127 }}>
					<PerfectScrollbar containerRef = {(ref) => { this.scrollRef = ref; }} >
						<div style={{ height: 20 }}></div>
						{ MessageListView }
						<div style={{ height: 20 }}></div>
					</PerfectScrollbar>
				</div>
				<div className="d-flex align-items-center bg-light" style={{ marginTop: 1, minHeight: 64, boxShadow: "0rem -0.065rem 0.1rem lightgray" }}>
					<InputFooter handleSendMessage={this.handleSendMessage}/>
				</div>
			</div>
		);
	}
}

const Header = ({ selectedUser }) => {
	if(!selectedUser) return null
	return (
		<div className="d-flex" style={{ height: 58, cursor: "default" }}>
			<div className="d-flex align-items-center justify-content-center ps-3">
				<img src={config.api.API+selectedUser.avatarUrl} className="img-thumbnail rounded-circle p-0 avatar-img-1" alt={"user-avatar"} />
			</div>
			<div className="d-flex flex-column justify-content-center flex-fill ps-2" style={{  }}>
				<div className="" style={{ fontSize: "1.1em" }}>{selectedUser.displayName}</div>
				{/* <div className="text-secondary" style={{ fontSize: "0.9em" }}>{latestMessage}</div> */}
			</div>
		</div>
	)
}

const InputFooter = (props) => {
	const [text, setText] = useState("")
	return (
		<div className="px-2 d-flex w-100">
			<div className="d-flex flex-fill px-4 align-items-center">
				<div className="d-flex justify-content-center align-items-center" style={{ height: "2em", width: "2em" }}>
					<div>
						<i className="far fa-comment-dots fa-2x text-secondary"></i>
					</div>
				</div>
				<div className="flex-fill px-2 d-flex flex-column justify-content-start py-1">
					<div id="footerInputBox" className="hover-raise py-2 px-3 bg-white rounded-3 text-dark" contentEditable="true" 
						onInput={e => {
							e.preventDefault(true)
							setText(e.target.textContent)
							// if(e.nativeEvent.inputType==="deleteContentForward") 
							// else if (e.nativeEvent.inputType==="deleteContentBackward")
							// else if (e.nativeEvent.inputType==="insertText")
						}} 
						onKeyPress={e => {
							if(e.code==="Enter") {
								e.preventDefault(true)
								setText("")
								document.getElementById("footerInputBox").textContent = ""
								props.handleSendMessage(text)
							}
						}}
						placeholder="Type a message" value={text} style={{ borderWidth: 1, borderStyle: "solid", borderColor: "#d5d5d5", outline: "none"}}>
						
					</div>
				</div>
				<div className="d-flex justify-content-center align-items-center">
					<div 
						onClick={e => {
							setText("")
							document.getElementById("footerInputBox").textContent = ""
							props.handleSendMessage(text)
						}} 
					className="hover-raise bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ cursor: "pointer", height: "2.4em", width: "2.4em"}}>
						<i className="text-white fas fa-chevron-right fa-lg m-0"></i>
					</div>
				</div>
			</div>
		</div>
	)
}

const MessageReceivedBox = ({ data }) => {
	return (
		<div className="py-2 px-4 d-flex justify-content-start">
			<div className="px-2 py-1 shadow-sm rounded-3" style={{ minWidth: 220, backgroundColor: "#d5e5d5",   borderWidth: 1, borderStyle: "outset" }}>
				<div className="text-dark">{data.text}</div>
				<div className="text-end text-secondary"><small>{new Date(data.ts).toISOString()}</small></div>
			</div>
		</div>
	)
}

const MessageSentBox = ({ data }) => {
	return (
		<div className="py-2 pe-4  d-flex justify-content-end" style={{ paddingLeft: 80 }}>
			<div className="px-2 py-1 shadow-sm rounded-3" style={{ minWidth: 220, backgroundColor: "#f0f0f0",   borderWidth: 1, borderStyle: "outset" }}>
				<div className="text-dark">{data.text}</div>
				<div className="text-end text-secondary"><small>{new Date(data.ts).toISOString()}</small></div>
			</div>
		</div>
	)
}


export default withRouter(connect(
	state => ({
		selectedUser: state.userReducer.selectedUser,
		activeUsers: state.userReducer.activeUsers,
		myInfo: state.userReducer.myInfo
	}), 
	{ setSelectedUser }
)(MainMessageArea))
