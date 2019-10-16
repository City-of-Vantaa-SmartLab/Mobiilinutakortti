import React from 'react';
import { Admin, Resource } from 'react-admin';
import finnishMessages from 'ra-language-finnish';
import authProvider from './providers/authProvider';
import juniorProvider from './providers/juniorProvider';
import { JuniorCreate, JuniorList, JuniorEdit } from './juniors';
import ChildCareIcon from '@material-ui/icons/ChildCare';

const messages = {
    'fi': finnishMessages,
};

const i18nProvider = locale => messages[locale];

const App = () =>
    <Admin locale="fi" i18nProvider={i18nProvider} dataProvider={juniorProvider} authProvider={authProvider}>
        <Resource name="juniors" create={JuniorCreate} edit={JuniorEdit} list={JuniorList} icon={ChildCareIcon} />
    </Admin>;

export default App;
