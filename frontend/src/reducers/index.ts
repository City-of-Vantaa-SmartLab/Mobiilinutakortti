import { combineReducers } from 'redux';
import authReducer from './authReducer';
import { authState } from '../types/authTypes';

const rootReducer = combineReducers({ auth: authReducer });


export interface AppState {
    auth: authState
}

export default rootReducer;