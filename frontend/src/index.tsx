import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import './index.css';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import { configureStore } from './store/getStore';

const store = configureStore();

createRoot(document.getElementById('root')!!).render(
    <Router>
        <Provider store={store}>
            <App />
        </Provider>
    </Router>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
