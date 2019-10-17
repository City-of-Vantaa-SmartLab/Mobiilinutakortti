import React from 'react';
import { Admin, Resource } from 'react-admin';
import finnishMessages from 'ra-language-finnish';
import { authProvider, dataProvider} from './providers';
import { JuniorList } from './components/junior';
import ChildCareIcon from '@material-ui/icons/ChildCare';

const messages = {
    'fi': finnishMessages,
};

const i18nProvider = locale => messages[locale];

const App = () =>
    <Admin locale="fi" i18nProvider={i18nProvider} dataProvider={dataProvider} authProvider={authProvider}>
        {permissions => [
            permissions === 'SUPERADMIN' || permissions === ' ADMIN'
            ? <Resource name="junior" list={JuniorList} icon={ChildCareIcon} />
            : null
        ]}
    </Admin>;

export default App;
