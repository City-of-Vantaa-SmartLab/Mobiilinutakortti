import { takeLatest, call, put } from 'redux-saga/effects';
import { post } from '../apis';
import { actionTypes } from './actionTypes';


interface AuthAttempt {
    type: actionTypes.AUTH_ATTEMPT,
    payload: { phone: string, password: string },
}

interface AuthSuccess {
    type: actionTypes.AUTH_SUCCESS,
    payload: string,
}

interface AuthFail {
    type: actionTypes.AUTH_FAIL,
    payload: string,
}

export function* rootSaga() {
    yield takeLatest(actionTypes.AUTH_ATTEMPT, auth);
}

//sagas

function* auth(action: AuthAttempt) {
    try {
        const response = yield call(post, '/auth', action.payload);
        yield put({ type: actionTypes.AUTH_SUCCESS,  payload: response });
    } catch (error) {
        yield put({ type: actionTypes.AUTH_FAIL, payload: error.message });
    }
}

export type actions = AuthAttempt | AuthSuccess | AuthFail;