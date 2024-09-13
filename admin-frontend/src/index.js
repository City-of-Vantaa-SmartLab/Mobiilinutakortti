import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

// This is React 17 implementation.
// For React 18 use:
//  import { createRoot } from 'react-dom/client';
//  const root = createRoot(document.getElementById("root"));
//  root.render(
// Deprecation warning may be ignored.
ReactDOM.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
    document.getElementById("root")
);
