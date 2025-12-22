import React from 'react';
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
  NumberInput
} from 'react-admin';
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

const CustomToolbar = (props) => (
  <Toolbar {...props}>
    <SaveButton disabled={props.pristine && !props.validating} />
  </Toolbar>
);

const kompassiIntegration = import.meta.env.VITE_ENABLE_KOMPASSI_INTEGRATION;

// Suppress React warnings about props for non-input elements.
const NonInput = React.memo(function NonInput({ children }) {
  return children;
});

export const EditYouthClubsList = (props) => {
  useAutoLogout();
  return (
  <List title="Nuorisotilat" bulkActionButtons={false} exporter={false} pagination={false} {...props}>
    <Datagrid>
      <TextField label="Nimi" source="name" />
      <BooleanField label="Aktiivinen" source="active" defaultValue={false} />
      <TextField label="Tilakohtainen viesti FI" source="messages.fi" />
      <TextField label="Tilakohtainen viesti EN" source="messages.en" />
      <TextField label="Tilakohtainen viesti SV" source="messages.sv" />
      {kompassiIntegration && (<BooleanField label="Kompassi-integraatio" source="kompassiIntegration.enabled" looseValue={true} />)}
      <EditButton />
    </Datagrid>
  </List>
)};

const YouthClubEditTitle = ({ record }) => (
  <span>{`Muokkaa tietoja: ${record.name}`}</span>
);

export const EditYouthClubs = (props) => {
  useAutoLogout();
  return (
  <Edit title={<YouthClubEditTitle />} {...props} mutationMode="pessimistic">
    <SimpleForm variant="standard" margin="normal" redirect="list" toolbar={<CustomToolbar />}>
      <BooleanInput label="Tila aktiivinen" source="active" />
      <StatusHelperText />
      <TextInput label="Tilakohtainen viesti FI" source="messages.fi" />
      <TextInput label="Tilakohtainen viesti EN" source="messages.en" />
      <TextInput label="Tilakohtainen viesti SV" source="messages.sv" />
      <MessageHelperText />

      {kompassiIntegration && (<>
        <NonInput><br /><hr /><br /></NonInput>
        <BooleanInput label="Kompassi-integraatio päällä" source="kompassiIntegration.enabled" defaultValue={false} />
        <KompassiHelperText />
        <NumberInput label="Kompassi ryhmä-id" source="kompassiIntegration.groupId" />
        <TextInput label="Kompassi aktiviteettityyppi-id:t" source="kompassiIntegration.activityTypeIds" parse={(value) => (value?.replace(/[^0-9,]/g, ''))} />
        <TextInput label="Aktiviteetin otsikko" source="kompassiIntegration.activityTitle" defaultValue={'Nuta-ilta'} />
      </>)}
    </SimpleForm>
  </Edit >
)};
