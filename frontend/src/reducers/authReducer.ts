import { authTypes, authActions, authState } from '../types/authTypes';


const initialState:authState = {
    loggedIn: false,
    token: '',
    error: ''
}

export default (state=initialState, action: authActions):authState => {
    switch(action.type) {
        case authTypes.AUTH_SUCCESS:
            return {...state, loggedIn: true, token: action.payload, error: ''};
        case authTypes.AUTH_FAIL: 
            return {...state, error: action.payload}
        default: 
            return state;
    }
}