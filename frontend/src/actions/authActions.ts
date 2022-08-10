import { takeLatest, call, put } from 'redux-saga/effects';
import { post, get, getCachedToken } from '../apis';
import { authTypes, AuthAttempt, LinkRequest, AuthWithCache } from '../types/authTypes';
import { userTypes, getUser } from '../types/userTypes';
import { saveTokenToStorage, cacheToken } from '../utils';

export function* authSaga() {
    yield takeLatest(authTypes.AUTH_ATTEMPT, auth);
    yield takeLatest(authTypes.AUTH_LINK_REQUEST, requestLink);
    yield takeLatest(userTypes.GET_USER, getUserInfo);
    yield takeLatest(authTypes.AUTH_WITH_CACHE, authWithCachedToken);
}

//sagas

function* getUserInfo(action: getUser): Generator<any, any, any> {
    try {
        const response = yield call(get, '/junior/getSelf', action.payload);
        yield put({ type: userTypes.GET_SELF_SUCCESS, payload: response });
    } catch (error) {
        localStorage.removeItem('token');
        yield put({ type: authTypes.LOGOUT });
        window.location.href = '/login'
    }
}

function* authWithCachedToken(action: AuthWithCache): Generator<any, any, any> {
    try {
        const response = yield call(getCachedToken);
        if (response.token) {
            yield call(saveTokenToStorage, response.token);
            yield put({ type: authTypes.AUTH_SUCCESS, payload: response.token });
            yield put({ type: userTypes.GET_USER, payload: response.token });
        }
    } catch (error) {}
}

function* auth(action: AuthAttempt): Generator<any, any, any> {
    try {
        const response = yield call(post, '/junior/login', action.payload);
        yield call(saveTokenToStorage, response.access_token);
        yield call(cacheToken, response.access_token);
        yield put({ type: authTypes.AUTH_SUCCESS, payload: response.access_token });
        yield put({ type: userTypes.GET_USER, payload: response.access_token });
    } catch (error) {
        yield put({ type: authTypes.AUTH_FAIL });
    }
}

function* requestLink(action: LinkRequest) {
    try {
        yield call(post, '/junior/reset', action.payload);
        yield put({ type: authTypes.LINK_REQUEST_SUCCESS });
    } catch (error) {
        yield put({ type: authTypes.LINK_REQUEST_FAIL });
    }
}
