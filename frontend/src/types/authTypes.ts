//action types

export enum authTypes {
    AUTH_ATTEMPT = "AUTH_ATTEMPT",
    AUTH_SUCCESS = "AUTH_SUCCESS",
    AUTH_FAIL = "AUTH_FAIL"
}

//action interfaces

export interface AuthAttempt {
    type: authTypes.AUTH_ATTEMPT,
    payload: { phone: string, password: string },
}

export interface AuthSuccess {
    type: authTypes.AUTH_SUCCESS,
    payload: string,
}

export interface AuthFail {
    type: authTypes.AUTH_FAIL,
    payload: string,
}


export type authActions = AuthAttempt | AuthSuccess | AuthFail;

//reducer interfaces

export interface authState {
    loggedIn: boolean,
    token: string | null,
    error: string
}