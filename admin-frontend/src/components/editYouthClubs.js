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
  NumberField
} from 'react-admin';

const StatusHelperText = () => (
  <p>Ei-aktiivista nuorisotilaa ei näytetä rekisteröintilomakkeella.</p>
);

const MessageHelperText = () => (
  <p>Tilakohtainen viesti lisätään järjestelmän lähettämien tekstiviestien loppuun. Jos tilakohtaista viestiä ei ole annettu, käytetään tekstiviestien lopussa vakiotervehdystä: Terveisin Vantaan Nuorisopalvelut</p>
);

const CustomToolbar = (props) => (
  <Toolbar {...props}>
    <SaveButton disabled={props.pristine && !props.validating} />
  </Toolbar>
);

const kompassiIntegration = process.env.REACT_APP_ENABLE_KOMPASSI_INTEGRATION;

export const EditYouthClubsList = (props) => (
  <List title="Nuorisotilat" bulkActionButtons={false} exporter={false} pagination={false} {...props}>
    <Datagrid>
      <TextField label="Nimi" source="name" />
      <BooleanField label="Aktiivinen" source="active" defaultValue={false} />
      <TextField label="Tilakohtainen viesti FI" source="messages.fi" />
      <TextField label="Tilakohtainen viesti EN" source="messages.en" />
      <TextField label="Tilakohtainen viesti SV" source="messages.sv" />
      kompassiIntegration && <BooleanField label="Kompassi-integraatio" source="kompassiIntegration?.enabled" defaultValue={false} />
      <EditButton />
    </Datagrid>
  </List>
);

export const EditYouthClubs = (props) => (
  <Edit title="Muokkaa nuorisotilan tietoja" {...props} undoable={false}>
    <SimpleForm variant="standard" margin="normal" redirect="list" toolbar={<CustomToolbar />}>
      <BooleanInput label="Tila aktiivinen" source="active" />
      <StatusHelperText />
      <TextInput label="Tilakohtainen viesti FI" source="messages.fi" />
      <TextInput label="Tilakohtainen viesti EN" source="messages.en" />
      <TextInput label="Tilakohtainen viesti SV" source="messages.sv" />
      kompassiIntegration && {<>
        <BooleanField label="Kompassi-integraatio" source="kompassiIntegration?.enabled" defaultValue={false} />
        <NumberField label="Kompassi organisaatio-id" source="kompassiIntegration?.organizationId" />
        <NumberField label="Kompassi ryhmä-id" source="kompassiIntegration?.groupId" />
        <TextField label="Kompassi aktiviteettityyppi-id:t" source="kompassiIntegration?.activityTypeIds" />
      </>}
      <MessageHelperText />
    </SimpleForm>
  </Edit >
);
