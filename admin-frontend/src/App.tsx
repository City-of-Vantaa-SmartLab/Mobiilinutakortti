import { Admin, Resource, Login, CustomRoutes } from 'react-admin';
import { lazy } from 'react';
import finnishMessages from 'ra-language-finnish';
import { authProvider, dataProvider } from './providers';
import { JuniorList, JuniorCreate, JuniorEdit } from './components/junior';
import { YouthClubList } from './components/youthClub';
import { EditYouthClubs, EditYouthClubsList} from './components/editYouthClubs';
import { LandingPage } from './components/landingPage';
import { YouthWorkerList, YouthWorkerCreate, YouthWorkerEdit } from './components/youthWorker';
import { routes, adminRoutes, checkInRoute } from './customRoutes';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import CustomLayout from './customLayout';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import useAdminPermission from './hooks/useAdminPermission';
import { AnnouncementCreate } from './components/announcement';
import EntraLogin from './components/entraLoginPage';

// Lazy-load extra entry features (separate chunk)
const ExtraEntryTypeList = lazy(() => import('./components/extraEntry/extraEntryType').then(m => ({ default: m.ExtraEntryTypeList })));
const ExtraEntryTypeCreate = lazy(() => import('./components/extraEntry/extraEntryType').then(m => ({ default: m.ExtraEntryTypeCreate })));
const ExtraEntryEdit = lazy(() => import('./components/extraEntry/extraEntry').then(m => ({ default: m.ExtraEntryEdit })));
const ExtraEntryList = lazy(() => import('./components/extraEntry/extraEntry').then(m => ({ default: m.ExtraEntryList })));

const CustomLoginPage = () =>
  !!import.meta.env.VITE_ENTRA_TENANT_ID ? (
    <EntraLogin />
  ) : (
    <Login backgroundImage="/nuta-admin-bg.jpg" />
  );

const messages = {
    'fi': {
        ...finnishMessages,
        resources: {
            youthWorker: {
                name: 'nuorisotyöntekijä |||| nuorisotyöntekijät',
            }
        }
    },
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
        <Admin dashboard={LandingPage} layout={CustomLayout} loginPage={CustomLoginPage} i18nProvider={i18nProvider} dataProvider={dataProvider} authProvider={authProvider} disableTelemetry >
            {permissions => [
                <Resource name="junior" options={{ label: 'Nuoret' }} list={JuniorList} create={JuniorCreate} icon={ChildCareIcon} edit={JuniorEdit} />,
                <Resource name="youthClub" options={{ label: 'Nuorisotilat' }} list={YouthClubList} />,
                permissions === 'ADMIN'
                    ? <Resource name="editYouthClubs" options={{ label: 'Nuorisotilojen muokkaus' }} list={EditYouthClubsList} edit={EditYouthClubs} />
                    : null,
                permissions === 'ADMIN'
                    ? <Resource name="youthWorker" options={{ label: 'Nuorisotyöntekijät' }} recordRepresentation={(record) => `${record.email}`} list={YouthWorkerList} create={YouthWorkerCreate} edit={YouthWorkerEdit} />
                    : null,
                permissions === 'ADMIN'
                    ? <Resource name="announcement" options={{ label: 'Tiedotus' }} create={AnnouncementCreate} />
                    : null,
                showExtraEntries && <Resource name="extraEntry" options={{ label: 'Lisämerkinnät' }} list={ExtraEntryList} edit={ExtraEntryEdit} />,
                permissions === 'ADMIN' && showExtraEntries
                    ? <Resource name="extraEntryType" options={{ label: 'Merkintätyypit' }} list={ExtraEntryTypeList} create={ExtraEntryTypeCreate} />
                    : null
            ]}
            <CustomRoutes>
                {customRoutes}
            </CustomRoutes>
            <CustomRoutes noLayout>
                {checkInRoute}
            </CustomRoutes>
        </Admin>
    )
}

export default App;
