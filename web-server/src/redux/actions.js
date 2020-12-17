import { SET_ACTIVE_USERS, SET_SELECTED_USER, SET_MY_INFO, SET_MESSAGES } from "./actionTypes";

export const setActiveUsers = users => {
    return ({ 
        type: SET_ACTIVE_USERS, 
        payload: { users } 
    });
}

export const setSelectedUser = user => {
    return ({ 
        type: SET_SELECTED_USER, 
        payload: { user } 
    });
}

export const setMyInfo = myInfo => {
    return ({ 
        type: SET_MY_INFO, 
        payload: { myInfo } 
    });
}

export const setMessages = messages => {
    return ({ 
        type: SET_MESSAGES, 
        payload: { messages } 
    });
}
