import React from 'react';
import { Admin } from 'react-admin';
import fakeDataProvider from 'ra-data-fakerest'; //React-admin requires a data provider to be able to run. This should be removed once a real data provider is implemented.
const dataProvider = fakeDataProvider({
  user: [
    {id: 0, name: "foo"},
    {id: 1, name: "bar"}
  ]
})


const App = () => <Admin dataProvider ={dataProvider} />;

export default App;
