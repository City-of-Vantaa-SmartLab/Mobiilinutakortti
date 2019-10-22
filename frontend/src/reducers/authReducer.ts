import { authTypes, authActions, authState } from '../types/authTypes';


const initialState:authState = {
    loggingIn: false,
    loggedIn: false,
    token: '',
    error: false,
}

export default (state=initialState, action: authActions):authState => {
    switch(action.type) {
        case authTypes.AUTH_ATTEMPT:
        return {...state, loggingIn: true, error: false};
        case authTypes.AUTH_SUCCESS:
            return {...state, loggingIn: false, loggedIn: true, token: action.payload, error: false};
        case authTypes.AUTH_FAIL: 
            return {...state, loggingIn: false, error: true}
        case authTypes.AUTH_LINK_REQUEST: 
            return {...state, error: false}
        default: 
            return state;
    }
}