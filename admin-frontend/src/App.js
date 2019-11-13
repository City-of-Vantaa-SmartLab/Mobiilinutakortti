import React from 'react';
import { Admin, Resource } from 'react-admin';
import finnishMessages from 'ra-language-finnish';
import { authProvider, dataProvider } from './providers';
import { JuniorList, JuniorCreate, JuniorEdit } from './components/junior';
import { YouthClubList } from './components/youthClub';
import { YouthWorkerList, YouthWorkerCreate, YouthWorkerEdit } from './components/youthWorker';
import routes from './customRoutes';
import ChildCareIcon from '@material-ui/icons/ChildCare';
import httpClient from './httpClient';
import api from './api';

const messages = {
    'fi': finnishMessages,
};

const i18nProvider = locale => messages[locale];

const sessionCheck = async () => {
    const url = api.youthWorker.self;
    const options = {
        method: 'GET'
    };
    await httpClient(url, options, false)
        .then(response => {
            if (response.statusCode < 200 || response.statusCode >= 300) {
                localStorage.removeItem('token');
                localStorage.removeItem('role');
                location.reload();
            }
        });
}

const App = () => {

    setInterval(sessionCheck, 180000);

    return (<Admin locale="fi" i18nProvider={i18nProvider} dataProvider={dataProvider} authProvider={authProvider} customRoutes={routes}>
        {permissions => [
            permissions === 'SUPERADMIN' || permissions === 'ADMIN'
                ? <Resource name="junior" options={{ label: 'Nuoret' }} list={JuniorList} create={JuniorCreate} icon={ChildCareIcon} edit={JuniorEdit} />
                : null,

            permissions === 'SUPERADMIN' || permissions === 'ADMIN'
                ? <Resource name="youthClub" options={{ label: 'Nuorisotalot' }} list={YouthClubList} />
                : null,

            permissions === 'SUPERADMIN'
                ? <Resource name="youthWorker" options={{ label: 'Nuorisotyöntekijät' }} list={YouthWorkerList} create={YouthWorkerCreate} edit={YouthWorkerEdit} />
                : null
        ]}
    </Admin>);
}

export default App;
