//action types

export enum authTypes {
    AUTH_ATTEMPT = "AUTH_ATTEMPT",
    AUTH_SUCCESS = "AUTH_SUCCESS",
    AUTH_FAIL = "AUTH_FAIL",
    AUTH_LINK_REQUEST = "AUTH_LINK_REQUEST",
    LOGOUT = "LOGOUT", 
    AUTH_WITH_CACHE = "AUTH_WITH_CACHE"
}


//action interfaces

export interface AuthAttempt {
    type: authTypes.AUTH_ATTEMPT,
    payload: { challenge: string, id: string },
}

export interface AuthSuccess {
    type: authTypes.AUTH_SUCCESS,
    payload: string,
}

export interface AuthFail {
    type: authTypes.AUTH_FAIL,
    payload: string,
}


export interface LinkRequest {
    type: authTypes.AUTH_LINK_REQUEST,
    payload: { phoneNumber: string },
}

export interface AuthWithCache {
    type: authTypes.AUTH_WITH_CACHE
}

export interface Logout {
    type: authTypes.LOGOUT,
}


export type authActions = AuthAttempt | AuthSuccess | AuthFail | LinkRequest | Logout | AuthWithCache;

//reducer interfaces

export interface authState {
    loggingIn: boolean,
    loggedIn: boolean,
    token: string,
    error: boolean
}
