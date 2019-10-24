import { takeLatest, call, put } from 'redux-saga/effects';
import { post, get } from '../apis';
import { authTypes, AuthAttempt, LinkRequest, AuthSuccess } from '../types/authTypes';
import { userTypes, getUser } from '../types/userTypes';

import { push } from 'connected-react-router';



export function* rootSaga() {
    yield takeLatest(authTypes.AUTH_ATTEMPT, auth);
    yield takeLatest(authTypes.AUTH_LINK_REQUEST, requestLink);
    yield takeLatest(userTypes.GET_USER, getUserInfo);
}

//sagas

function setAuthToken(token:string) {
    localStorage.setItem('token', token)
  }

 function* getUserInfo(action: getUser) {
    try {
        const response = yield call(get, '/junior/getSelf', action.payload);
        yield put({ type: userTypes.GET_SELF_SUCCESS,  payload: response });
    } catch (error) {
        // yield put({ type: userTypes.GET_SELF_FAIL });
    }
 } 

function* auth(action: AuthAttempt) {
    try {
        const response = yield call(post, '/junior/login', action.payload);
        yield call(setAuthToken, response.access_token);
        yield put({ type: authTypes.AUTH_SUCCESS,  payload: response.access_token });
        yield put({ type: userTypes.GET_USER,  payload: response.access_token });
        // substituted with props.history.push in login page component
        // yield put(push('/'));

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

