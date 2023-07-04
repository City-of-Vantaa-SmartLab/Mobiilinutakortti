import React, { useEffect } from 'react';
import { Admin, Resource, Login } from 'react-admin';
import finnishMessages from 'ra-language-finnish';
import { authProvider, dataProvider } from './providers';
import { JuniorList, JuniorCreate, JuniorEdit } from './components/junior';
import { YouthClubList } from './components/youthClub';
import { EditYouthClubs, EditYouthClubsList} from './components/editYouthClubs';
import { ExtraEntryTypeList, ExtraEntryTypeCreate} from './components/extraEntry/extraEntryType';
import { LandingPage } from './components/landingPage';
import { YouthWorkerList, YouthWorkerCreate, YouthWorkerEdit } from './components/youthWorker';
import { routes, adminRoutes } from './customRoutes';
import ChildCareIcon from '@material-ui/icons/ChildCare';
import { httpClient } from './httpClients'
import api from './api';
import { AUTH_LOGOUT } from 'react-admin';
import CustomLayout from './customLayout';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import useAdminPermission from './hooks/useAdminPermission';
import { AnnouncementCreate } from './components/announcement';
import { ExtraEntryCreate, ExtraEntryList } from './components/extraEntry/extraEntry';

const CustomLoginPage = () => <Login backgroundImage="/nuta-admin-bg.jpg" />;

const messages = {
    'fi': finnishMessages,
};

const i18nProvider = polyglotI18nProvider(locale => messages[locale], 'fi');

const App = () => {
    const { isAdmin } = useAdminPermission();
    const customRoutes = routes.concat(...isAdmin ? adminRoutes : []);
    const showExtraEntries = process.env.REACT_APP_ENABLE_EXTRA_ENTRIES;

    useEffect(() => {
        let validCheck = setInterval(async () => {
            const url = api.auth.login;
            const body = {
                method: 'GET'
            };
            if(!window.location.href.includes("checkIn")){
                await httpClient(url, body).then(async (response) => {
                    if (response.statusCode < 200 || response.statusCode >= 300 || response.result === false) {
                        await authProvider(AUTH_LOGOUT, {});
                        window.location.reload();
                    }
                })
            }
        }, 60000);

        return () => {
            clearInterval(validCheck);
            validCheck = null;
        }
    }, []);

    return (
        <Admin dashboard={LandingPage} layout={CustomLayout} loginPage={CustomLoginPage} i18nProvider={i18nProvider} dataProvider={dataProvider} authProvider={authProvider} customRoutes={customRoutes} disableTelemetry >
            {permissions => [
                <Resource name="junior" options={{ label: 'Nuoret' }} list={JuniorList} create={JuniorCreate} icon={ChildCareIcon} edit={JuniorEdit} />,
                <Resource name="youthClub" options={{ label: 'Nuorisotilat' }} list={YouthClubList} />,
                permissions === 'ADMIN'
                    ? <Resource name="editYouthClubs" options={{ label: 'Nuorisotilojen muokkaus' }} list={EditYouthClubsList} edit={EditYouthClubs} />
                    : null,
                permissions === 'ADMIN'
                    ? <Resource name="youthWorker" options={{ label: 'Nuorisotyöntekijät' }} list={YouthWorkerList} create={YouthWorkerCreate} edit={YouthWorkerEdit} />
                    : null,
                permissions === 'ADMIN'
                    ? <Resource name="announcement" options={{ label: 'Tiedotus' }} create={AnnouncementCreate} />
                    : null,
                showExtraEntries && <Resource name="extraEntry" options={{ label: 'Lisämerkinnät' }} list={ExtraEntryList} create={ExtraEntryCreate} />,
                permissions === 'ADMIN' && showExtraEntries
                    ? <Resource name="extraEntryType" options={{ label: 'Merkintätyypit' }} list={ExtraEntryTypeList} create={ExtraEntryTypeCreate} />
                    : null
            ]}
        </Admin>
    )
}

export default App;
