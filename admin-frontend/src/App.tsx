import React from 'react';
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
import ChildCareIcon from '@mui/icons-material/ChildCare';
import CustomLayout from './customLayout';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import useAdminPermission from './hooks/useAdminPermission';
import { AnnouncementCreate } from './components/announcement';
import { ExtraEntryEdit, ExtraEntryList } from './components/extraEntry/extraEntry';
import EntraLogin from './components/entraLoginPage';

const CustomLoginPage = () =>
  !!import.meta.env.VITE_ENTRA_TENANT_ID ? (
    <EntraLogin />
  ) : (
    <Login backgroundImage="/nuta-admin-bg.jpg" />
  );

const messages = {
    'fi': finnishMessages,
};

const i18nProvider = polyglotI18nProvider(locale => messages[locale], 'fi');

const App = () => {
    const { isAdmin } = useAdminPermission();
    const customRoutes = routes.concat(...isAdmin ? adminRoutes : []);
    const showExtraEntries = import.meta.env.VITE_ENABLE_EXTRA_ENTRIES;

    // Since MSAL redirect URI call has the token exchange code as a URL fragment ("#code="), we have to do this
    // outside react-admin and routing. Otherwise the fragment indicator (#) is interpreted as a route and MSAL login fails.
    if (import.meta.env.VITE_ENTRA_TENANT_ID && (window.location.href + '/').includes(import.meta.env.VITE_ENTRA_REDIRECT_URI)) {
        return (<EntraLogin />)
    }

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
                showExtraEntries && <Resource name="extraEntry" options={{ label: 'Lisämerkinnät' }} list={ExtraEntryList} edit={ExtraEntryEdit} />,
                permissions === 'ADMIN' && showExtraEntries
                    ? <Resource name="extraEntryType" options={{ label: 'Merkintätyypit' }} list={ExtraEntryTypeList} create={ExtraEntryTypeCreate} />
                    : null
            ]}
        </Admin>
    )
}

export default App;
