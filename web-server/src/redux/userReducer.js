import { SET_ACTIVE_USERS, SET_MESSAGES, SET_MY_INFO, SET_SELECTED_USER } from "./actionTypes";

const initialState = {
    myInfo: null,
    activeUsers: [
        
    ],
    selectedUser: null,
    messages: []
}

const readWriteActiveUsers = (state = initialState, action) => {
    switch (action.type) {
        case SET_ACTIVE_USERS: {
            return ({ ...state, activeUsers: action.payload.users })
        }
        case SET_SELECTED_USER: {
            return ({ ...state, selectedUser: action.payload.user })
        }
        case SET_MY_INFO: {
            return ({ ...state, myInfo: action.payload.myInfo })
        }
        case SET_MESSAGES: {
            return ({ ...state, messages: action.payload.messages })
        }
        default: {
            return state;
        }
    }
};

export default readWriteActiveUsers;