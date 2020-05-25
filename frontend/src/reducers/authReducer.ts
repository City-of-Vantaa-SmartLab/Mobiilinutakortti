import { authTypes, authActions, authState } from '../types/authTypes';


const initialState: authState = {
    loggingIn: false,
    loggedIn: false,
    token: '',
    error: false,
    message: '',
}

export default (state = initialState, action: authActions): authState => {
    switch (action.type) {
        case authTypes.AUTH_ATTEMPT:
            return { ...state, loggingIn: true, error: false };
        case authTypes.AUTH_SUCCESS:
            return { ...state, loggingIn: false, loggedIn: true, token: action.payload, error: false };
        case authTypes.AUTH_FAIL:
            return { ...state, loggingIn: false, error: true, message: action.payload };
        case authTypes.AUTH_LINK_REQUEST:
            return { ...state, error: false };
        case authTypes.LINK_REQUEST_SUCCESS:
            return { ...state, error: false, message: action.payload };
        case authTypes.LINK_REQUEST_FAIL:
            return { ...state, error: true, message: action.payload };
        case authTypes.LOGOUT:
            return { ...state, loggedIn: false, error: false}
        default:
            return state;
    }
}
