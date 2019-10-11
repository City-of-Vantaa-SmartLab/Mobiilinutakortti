import React from 'react';
import { Admin } from 'react-admin';
import dataProvider from './dataProvider';
import authProvider from './authProvider';

const App = () => <Admin dataProvider ={dataProvider} authProvider={authProvider} />;

export default App;
