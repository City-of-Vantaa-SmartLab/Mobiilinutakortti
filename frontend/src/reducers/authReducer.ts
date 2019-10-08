import { actionTypes } from '../actions/actionTypes';
import { actions } from '../actions/auth'

export interface authState {
    loggedIn: boolean,
    token: string,
    error: string
}

const initialState:authState = {
    loggedIn: false,
    token: '',
    error: ''
}

export default (state=initialState, action: actions):authState => {
    switch(action.type) {
        case actionTypes.AUTH_SUCCESS:
            return {...state, loggedIn: true, token: action.payload, error: ''};
        case actionTypes.AUTH_FAIL: 
            return {...state, error: action.payload}
        default: 
            return state;
    }
}