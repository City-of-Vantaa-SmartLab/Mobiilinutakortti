import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';

import './index.css';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import { getStore } from './store/getStore';

const store = getStore();

createRoot(document.getElementById('root')!!).render(
    <Router>
        <Provider store={store}>
            <App />
        </Provider>
    </Router>
);

serviceWorker.register();
