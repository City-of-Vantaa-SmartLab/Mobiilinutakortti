import { combineReducers } from 'redux';
import authReducer, { authState } from './authReducer';


const rootReducer = combineReducers({ auth: authReducer });


export interface AppState {
    auth: authState
}

export default rootReducer;