import { SET_ACTIVE_USERS, SET_SELECTED_USER, SET_MY_INFO } from "./actionTypes";

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
