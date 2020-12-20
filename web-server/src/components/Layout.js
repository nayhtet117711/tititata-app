import React, { Component } from "react"
import SideBar from "./SideBar"
import MainMessageArea from "./MainMessageArea"
import { withRouter, Switch, Route, Redirect } from "react-router-dom";
import { connect } from "react-redux"
import { setMyInfo, setActiveUsers, setMessages } from "../redux/actions"
import socket from "../socketClient"
import VideoCall from "./testVideoCall"

class Layout extends Component {
	constructor(props) {
		super(props)
		this.state = {
			page: { width: 800, height: 800 }
		}
		
	}

	componentDidMount() {
		
		socket.doConnect(this.props.displayName)

		// this.testVideoCall()	

		window.onresize = (e) => {
            this.responsiveHandler(e.target)
		}
		this.responsiveHandler(window)

		this.handleSocketClient()

		setTimeout(this.listeningMessages, 10)

		this.videoCall = new VideoCall(socket)
		this.videoCall.listen()
			
	}

	testVideoCall = async (socketId) => {
		console.log("testVideoCall: ", socketId)
		try {
			
			await this.videoCall.makeCall(socketId)
		} catch(error) {
			console.error(error)
		}

		// console.log(this.videoCall)

	}

	listeningMessages = () => {
		socket.on("priv-msg", data => {
			if(data.from===this.props.myInfo.socketId) {
				this.props.setMessages([...this.props.messages, {...data, type: "sent"}])
				// this.setState(prev=> ({ messages: [...prev.messages, {...data, type: "sent"}] }))
				// const audio = new window.Audio("https://proxy.notificationsounds.com/notification-sounds/clearly-602/download/file-sounds-1143-clearly.mp3");
				// audio.volume = 0.1;
				// audio.play();
			} else if(data.to===this.props.myInfo.socketId) {
				this.props.setMessages([...this.props.messages, {...data, type: "received"}])
				const audio = new window.Audio("https://proxy.notificationsounds.com/message-tones/pristine-609/download/file-sounds-1150-pristine.mp3");
				audio.volume = 0.5;
				audio.play();
			}
		})
	}

	componentWillUnmount() {
		socket.doDisconnect()
	}

	handleSocketClient() {
		// socket.onConnect((socketId) => {
		// 	console.log(socketId)
		// })
		socket.on("user-list-updated", d => {
			// console.log("user-list-updated ", d)
			const userList = this.props.myInfo ? d.userList.filter(v => v.socketId!==this.props.myInfo.socketId) : d.userList
			this.props.setActiveUsers(userList)
		})
		socket.on("welcome-my-info", d => {
			this.props.setMyInfo(d.myInfo)
		})
	}

	responsiveHandler = (window) => {
		this.setState({ page: { width: window.innerWidth, height: window.innerHeight } })
	}

	render() {
		const widthPercent = this.state.page.width>=3840 ? "40%" 
			: this.state.page.width>= 2160 ? "60%" 
			: this.state.page.width>= 1920 ? "75%" 
			: this.state.page.width>= 1366 ? "85%"
			: this.state.page.width>= 1125 ? "95%" 
			: "100%"

		if(!socket) return "Connecting.."
		
		return (
			<div className="bg-secondary d-flex justify-content-center" style={{ height: "100vh", padding: 0 }}>
				<div className="d-flex border shadow" style={{ height: "100%", width: widthPercent, }}>
					{/* <SideBar className="bg-light" style={{ minWidth: 320, borderRight: '1px solid lightgray' }} page={this.state.page} /> */}
					<Switch>
						<Route path={`/:userId`}>
							<>
								<SideBar 
									onCall={this.testVideoCall} 
									className="bg-light" 
									style={{ width: this.state.page.width>=1000 ? 280 : !this.props.menuShow ? this.state.page.width-60 : 0, borderRight: '1px solid lightgray' }} 
									page={this.state.page} />
								<MainMessageArea className="bg-white flex-fill" page={this.state.page} style={{ width: this.state.page.width>=1000 ? undefined: 60 }} />
							</>
						</Route>
						<Route path={`/`}>
							<>
								<SideBar 
									onCall={this.testVideoCall}  
									className="bg-light" 
									style={{ width: this.state.page.width>=1000 ? 320 : "100%", borderRight: '1px solid lightgray' }} 
									page={this.state.page} />
								{this.state.page.width>=1000 && <EmptyUserArea />}
							</>							
						</Route>
						<Redirect to="/" />
					</Switch>
				</div>
			</div>
		);
	}

}

const EmptyUserArea = () => {
	return (
		<div className="flex-fill d-flex align-items-center justify-content-center bg-white">
			<div className="">
				<div className="h4 text-secondary text-center">Send your Titi Tata to your friends</div>
				<div className="h5 text-secondary text-center">Select the user from the left menu to start messaging!</div>
			</div>
		</div>
	)
}

export default withRouter(connect( 
		state => ({ 
			activeUsers: state.userReducer.activeUsers,
			myInfo: state.userReducer.myInfo,
			messages: state.userReducer.messages,
			menuShow: state.userReducer.menuShow,
			selectedUser: state.userReducer.selectedUser
		}), 
		{ setMyInfo, setActiveUsers, setMessages }
	)
	(Layout));
