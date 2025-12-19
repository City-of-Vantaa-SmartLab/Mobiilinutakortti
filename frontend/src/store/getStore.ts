import type { Store } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import { createBrowserHistory } from 'history';
import createSagaMiddleware from 'redux-saga';
import rootReducer, { AppState } from '../reducers';
import { rootSaga } from '../actions'
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { authActions, authTypes } from "../types/authTypes";
import { LangActions, LangTypes} from "../types/langTypes";
import { userActions, userTypes } from "../types/userTypes";
import { Language } from "../customizations/types";

export const history = createBrowserHistory();

const token: string = localStorage.getItem('token') ?? '';
const lang: string | null  = localStorage.getItem('lang');
const loggedIn: boolean = (token !== null);

const persistedState = {
    auth: {
        loggedIn,
        token,
        loggingIn: false,
        error: false,
        message: null
    }
}

export function getStore(): Store<AppState> {
  const sagaMiddleware = createSagaMiddleware();
  const store = configureStore({
    reducer: rootReducer(),
    preloadedState: persistedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: false, serializableCheck: false, immutableCheck: false }).concat(sagaMiddleware),
    devTools: import.meta.env.DEV
  });

    sagaMiddleware.run(rootSaga);
    store.dispatch({ type: LangTypes.SET_LANG, lang: lang as Language ?? 'fi' })

    if (loggedIn) {
      store.dispatch({ type: userTypes.GET_USER, payload: token })
    } else {
      store.dispatch({ type: authTypes.AUTH_WITH_CACHE })
    }

    return store;
}

export type AppDispatch = (action: authActions | LangActions | userActions) => void
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector
