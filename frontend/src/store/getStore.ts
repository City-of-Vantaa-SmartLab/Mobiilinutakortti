import { createStore, Store, applyMiddleware, compose } from 'redux';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'connected-react-router'
import createSagaMiddleware from 'redux-saga';
import rootReducer, { AppState } from '../reducers';
import { rootSaga } from '../actions/authActions';

export const history = createBrowserHistory();

const token: string | null  = localStorage.getItem('token');
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
        rootReducer(history),
        persistedState,
        compose(
            applyMiddleware(
                routerMiddleware(history),
                sagaMiddleware
            )
        )
    );

    sagaMiddleware.run(rootSaga);

    return store;
}
