import { createStore, Store, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootReducer, { AppState } from '../reducers';
import { rootSaga } from '../actions/authActions';


const userToken:string | null = localStorage.getItem('token') ? localStorage.getItem('token') : ''
const isLogged:boolean = (userToken === null);

const persistedState = {
    auth: {
        loggedIn: isLogged,
        token: userToken,
    }
}

export function configureStore(): Store<AppState> {

    const sagaMiddleware = createSagaMiddleware();
    const store = createStore(rootReducer, persistedState, applyMiddleware(sagaMiddleware));

    sagaMiddleware.run(rootSaga);

    return store;
  }