import { combineReducers } from 'redux';
import authReducer from './authReducer';
import { authState } from '../types/authTypes';
import userReducer from './userReducer';
import { userState } from '../types/userTypes';

const defaultExp = () => combineReducers({
    auth: authReducer,
    user: userReducer
});

export default defaultExp

export interface AppState {
    auth: authState,
    user: userState
}
