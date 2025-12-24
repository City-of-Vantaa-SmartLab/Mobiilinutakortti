import { combineReducers } from 'redux';
import authReducer from './authReducer';
import { authState } from '../types/authTypes';
import userReducer from './userReducer';
import { userState } from '../types/userTypes';
import langReducer from './langReducer';
import { LangState } from '../types/langTypes';

const rootReducer = combineReducers({
    auth: authReducer,
    lang: langReducer,
    user: userReducer
});

export default rootReducer

export interface AppState {
    auth: authState
    lang: LangState
    user: userState
}
