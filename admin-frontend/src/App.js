import React from 'react';
import { Admin, Resource } from 'react-admin';
import authProvider from './providers/authProvider';
import juniorProvider from './providers/juniorProvider';
import { JuniorCreate, JuniorList, JuniorEdit } from './juniors';
import ChildCareIcon from '@material-ui/icons/ChildCare';

const App = () =>
    <Admin dataProvider={juniorProvider} authProvider={authProvider}>
        <Resource name="juniors" create={JuniorCreate} edit={JuniorEdit} list={JuniorList} icon={ChildCareIcon} />
    </Admin>;

export default App;
