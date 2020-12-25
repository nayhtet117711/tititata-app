import React, { Component } from "react"
import { BrowserRouter } from "react-router-dom"
import Layout from "./components/Layout"
import { Provider } from 'react-redux'
import reduxStore from './redux/reduxStore'
import EntranceModal from "./components/EntranceModal"
// import socket from "./socketClient"

class App extends Component {
	constructor() {
		super()
		this.state = {
			modalVisible: false,
			enteranceName: null//"User "+Math.round(Math.random() * 100)
		}
	}
	onEnter = enteranceName => {
		this.setState({ modalVisible: false, enteranceName })
	}
	render() {
		return (
			<Provider store={reduxStore}>
				<BrowserRouter>
					{ this.state.modalVisible 
						? <EntranceModal visible={this.state.modalVisible} onEnter={this.onEnter} />
					 	: <Layout displayName={this.state.enteranceName}/> 
					}
					
				</BrowserRouter>
			</Provider>
		);
	}
}

export default App;
