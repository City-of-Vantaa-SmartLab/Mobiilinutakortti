export enum userTypes {
    GET_USER = "GET_USER",
    GET_SELF_SUCCESS = "GET_SELF_SUCCESS",
    GET_SELF_FAIL = "GET_SELF_FAIL"
}

export interface userState {
    id: string,
    name: string
}

export interface getSelfSuccess {
    type: userTypes.GET_SELF_SUCCESS,
    payload: {id: string, name: string},
}

export interface getSelfFail {
    type: userTypes.GET_SELF_FAIL,
    payload: string,
}

export interface getUser {
    type: userTypes.GET_USER,
    payload: string,
}

export type userActions = getSelfSuccess | getSelfFail | getUser;