import {
  List,
  Edit,
  EditButton,
  SimpleForm,
  Datagrid,
  TextField,
  TextInput,
  BooleanInput,
  BooleanField,
  Toolbar,
  SaveButton,
  NumberInput,
  ListProps,
  EditProps,
  useRecordContext
} from 'react-admin';
import { Divider } from '@mui/material';
import useAutoLogout from '../hooks/useAutoLogout';

const StatusHelperText = () => (
  <p>Nuoren rekisteröintilomakkeella näytetään vain aktiiviset nuorisotilat.</p>
);

const MessageHelperText = () => (
  <p>Tilakohtainen viesti lisätään järjestelmän lähettämien tekstiviestien loppuun. Jos tilakohtaista viestiä ei ole annettu, käytetään tekstiviestien lopussa vakiotervehdystä: Terveisin Vantaan Nuorisopalvelut</p>
);


const KompassiHelperText = () => (<>
  <p>Kompassi-integraatio vaatii myös oikean ryhmä-id:n, jotta sisäänkirjautumiset rekisteröityvät Kompassiin.</p><p>Erota aktiviteettityyppi-id:t pilkulla, jos useita.</p><p>Aktiviteetin otsikon perään lisätään automaattisesti päivämäärä.</p>
</>);

const CustomToolbar = (props: any) => (
  <Toolbar {...props}>
    <SaveButton disabled={props.pristine && !props.validating} />
  </Toolbar>
);

const kompassiIntegration = import.meta.env.VITE_ENABLE_KOMPASSI_INTEGRATION;

export const EditYouthClubList = (props: ListProps) => {
  useAutoLogout();
  return (
  <List title="Nuorisotilat" exporter={false} pagination={false} {...props}>
    <Datagrid bulkActionButtons={false} rowClick={false}>
      <TextField label="Nimi" source="name" />
      <BooleanField label="Aktiivinen" source="active" />
      <TextField label="Tilakohtainen viesti FI" source="messages.fi" />
      <TextField label="Tilakohtainen viesti EN" source="messages.en" />
      <TextField label="Tilakohtainen viesti SV" source="messages.sv" />
      {kompassiIntegration && (<BooleanField label="Kompassi-integraatio" source="kompassiIntegration.enabled" looseValue />)}
      <EditButton />
    </Datagrid>
  </List>
)};

const YouthClubEditTitle = () => {
  const record = useRecordContext();
  if (!record) return null;
  return <span>{`Muokkaa tietoja: ${record.name}`}</span>;
};

export const EditYouthClub = (props: EditProps) => {
  useAutoLogout();
  return (
  <Edit title={<YouthClubEditTitle />} {...props} mutationMode="pessimistic" redirect="list">
    <SimpleForm toolbar={<CustomToolbar />}>
      <BooleanInput label="Tila aktiivinen" source="active" />
      <StatusHelperText />
      <TextInput label="Tilakohtainen viesti FI" source="messages.fi" sx={{ width: 600 }} />
      <TextInput label="Tilakohtainen viesti EN" source="messages.en" sx={{ width: 600 }} />
      <TextInput label="Tilakohtainen viesti SV" source="messages.sv" sx={{ width: 600 }} />
      <MessageHelperText />

      {kompassiIntegration && (<>
        <Divider sx={{ width: '100%', my: 3, borderColor: '#808080' }} />
        <BooleanInput label="Kompassi-integraatio päällä" source="kompassiIntegration.enabled" defaultValue={false} />
        <KompassiHelperText />
        <NumberInput label="Kompassi ryhmä-id" source="kompassiIntegration.groupId" sx={{ width: 400 }} />
        <TextInput label="Kompassi aktiviteettityyppi-id:t" source="kompassiIntegration.activityTypeIds" parse={(value) => (value?.replace(/[^0-9,]/g, ''))} sx={{ width: 400 }} />
        <TextInput label="Aktiviteetin otsikko" source="kompassiIntegration.activityTitle" defaultValue={'Nuta-ilta'} sx={{ width: 400 }} />
      </>)}
    </SimpleForm>
  </Edit >
)};
