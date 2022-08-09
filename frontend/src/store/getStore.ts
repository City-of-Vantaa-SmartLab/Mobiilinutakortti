import { createStore, Store, applyMiddleware, compose } from 'redux';
import { createBrowserHistory } from 'history';
import createSagaMiddleware from 'redux-saga';
import rootReducer, { AppState } from '../reducers';
import { rootSaga } from '../actions'
import {TypedUseSelectorHook, useDispatch, useSelector} from "react-redux";
import {authActions} from "../types/authTypes";
import {LangActions, LangTypes} from "../types/langTypes";
import {userActions} from "../types/userTypes";

export const history = createBrowserHistory();

const token: string | null  = localStorage.getItem('token');
const lang: string | null  = localStorage.getItem('lang');
const isLogged: boolean = (token !== null);


const persistedState = {
    auth: {
        loggedIn: isLogged,
        token: token ? token : '',
    }
}

export function configureStore(): Store<AppState> {
    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(
        rootReducer(),
        persistedState,
        compose(applyMiddleware(sagaMiddleware))
    );

    sagaMiddleware.run(rootSaga);
    store.dispatch({ type: LangTypes.SET_LANG, lang: lang ?? 'fi' })

    return store;
}

export type AppDispatch = (action: authActions | LangActions | userActions) => void
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector
