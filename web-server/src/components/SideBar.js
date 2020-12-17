import React, { Component } from "react"
import PerfectScrollbar from 'react-perfect-scrollbar'
import { withRouter } from "react-router-dom"
import { connect } from "react-redux";
import { setSelectedUser } from "../redux/actions"
import config from "../config"
 
class SideBar extends Component {
	constructor() {
		super()
		this.state = {
			
		}
	}

	navigateToMessage = (user) => {
		this.props.setSelectedUser(user)
		this.props.history.replace({ pathname: "/"+user.socketId,  })
	}

	render() {
		const userListView = this.props.activeUsers.map(v => (
			<UserItem 
				match = {this.props.match}
				key={v.socketId} user={v} latestMessage={"Hello slkdfkdfkdfkdkdkdk"+ v.socketId } 
				onClick={() => this.navigateToMessage(v)}
			/>
		))
		return (
			<div className={"" + this.props.className} style={{ ...this.props.style}} id="sidebar-17">
				<div className="d-flex align-items-center bg-light" style={{ height: 60, boxShadow: "0rem 0.065rem 0.12rem lightgray", marginBottom: 1 }}>
					{ this.props.myInfo && <Header myInfo = {this.props.myInfo} /> }
				</div>
				
				<div className="d-flex flex-column" style={{ height: this.props.page.height-80 }}>
					<PerfectScrollbar >
						{userListView}
					</PerfectScrollbar>
				</div>
			</div>
		);
	}

}

const Header = ({ myInfo }) => {
	return (
		<div className="d-flex" style={{ height: 58, cursor: "default" }}>
			<div className="d-flex align-items-center justify-content-center ps-3">
				<img src={config.api.API + myInfo.avatarUrl} className="img-thumbnail rounded-circle p-0 avatar-img-1" alt={"user-avatar"} />
			</div>
			<div className="d-flex flex-column justify-content-center flex-fill ps-2" style={{  }}>
				<div className="" style={{ fontSize: "1.1em" }}>{myInfo.displayName}</div>
				{/* <div className="text-secondary" style={{ fontSize: "0.9em" }}>{latestMessage}</div> */}
			</div>
		</div>
	)
}

const UserItem = ({ user, latestMessage, onClick=()=>null, match }) => {
	return (
		<div className={"d-flex bg-white user-item "+(match.params.userId===user.socketId ? "user-item-selected" : "")} title={latestMessage} style={{ height: 70, cursor: "pointer" }} onClick={onClick}>
			<div className="d-flex align-items-center justify-content-center ps-3">
				<img src={config.api.API + user.avatarUrl} className="img-thumbnail rounded-circle p-0 avatar-img-1" alt={user.socketId} />
			</div>
			<div className="d-flex flex-column justify-content-center flex-fill" style={{ marginLeft: -30, paddingLeft: 42, borderBottom: "1px solid #efefef" }}>
				<div className="" style={{ fontSize: "1em" }}>{user.displayName}</div>
				<div className="text-secondary ellipsis" style={{ fontSize: "0.9em" }}>{latestMessage}</div>
			</div>
		</div>
	)
}

export default withRouter(connect( 
	state => ({ 
		activeUsers: state.userReducer.activeUsers,
		myInfo: state.userReducer.myInfo
	}), 
	{ setSelectedUser }
)(SideBar))
