import { combineReducers } from 'redux';
import authReducer from './authReducer';
import { authState } from '../types/authTypes';
import userReducer from './userReducer';
import { userState } from '../types/userTypes';
import { History } from 'history';

import { connectRouter } from 'connected-react-router';

const defaultExp = (history: History) => combineReducers({
    router: connectRouter(history),
    auth: authReducer,
    user: userReducer
});

export default defaultExp

export interface AppState {
    auth: authState,
    user: userState
}
