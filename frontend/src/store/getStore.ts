import { configureStore } from '@reduxjs/toolkit';
import { createBrowserHistory } from 'history';
import createSagaMiddleware from 'redux-saga';
import rootReducer, { AppState } from '../reducers';
import { rootSaga } from '../actions'
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { authTypes } from "../types/authTypes";
import { LangTypes} from "../types/langTypes";
import { userTypes } from "../types/userTypes";
import { Language } from "../customizations/types";

export const history = createBrowserHistory();

const token: string = localStorage.getItem('token') ?? '';
const lang: string | null  = localStorage.getItem('lang');
const loggedIn: boolean = (token !== null);

const persistedState: Partial<AppState> = {
    auth: {
        loggedIn,
        token,
        loggingIn: false,
        error: false,
        message: null
    }
}

export function getStore() {
  const sagaMiddleware = createSagaMiddleware();
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: persistedState as any,
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

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = ReturnType<typeof getStore>
export type AppDispatch = AppStore['dispatch']
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector
