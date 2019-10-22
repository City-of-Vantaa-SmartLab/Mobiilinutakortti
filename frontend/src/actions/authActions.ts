import { takeLatest, call, put } from 'redux-saga/effects';
import { post } from '../apis';
import { authTypes, AuthAttempt, LinkRequest } from '../types/authTypes';

import { push } from 'react-router-redux';



export function* rootSaga() {
    yield takeLatest(authTypes.AUTH_ATTEMPT, auth);
    yield takeLatest(authTypes.LINK_REQUEST, requestLink);
}

//sagas

function setAuthToken(token: object) {
    localStorage.setItem('token', JSON.stringify(token))
}

function* auth(action: AuthAttempt) {
    try {
        const response = yield call(post, '/junior/login', action.payload);
        yield call(setAuthToken, response.access_token);
        yield put({ type: authTypes.AUTH_SUCCESS, payload: response.access_token });
        yield put(push('/'));

    } catch (error) {
        yield put({ type: authTypes.AUTH_FAIL });
    }
}

function* requestLink(action: LinkRequest) {
    try {
        //not used and doesn't affect the app for now
        const response = yield call(post, '/junior/reset', action.payload);
    } catch (error) {

    }
}

