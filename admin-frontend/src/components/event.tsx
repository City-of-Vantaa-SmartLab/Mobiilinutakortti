import { useState, useCallback } from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  useNotify,
  ListProps,
  CreateProps,
  EditProps,
  useRecordContext,
  EditButton,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  DateInput,
  NumberInput,
  required
} from 'react-admin';
import { Divider } from '@mui/material';
import Button from '@mui/material/Button';
import { successSound, errorSound } from '../audio/audio.js'
import ListIcon from '@mui/icons-material/List';
import CropFreeIcon from '@mui/icons-material/CropFree';
import useAutoLogout from '../hooks/useAutoLogout';
import { httpClient } from '../httpClients/httpClient.js';
import api from '../api.js';
import { STATE } from '../state';
import { CalendarHelper } from './calendarHelper';

interface EventRecord {
  id: number;
  name: string;
  active: boolean;
}

// Custom button components in Datagrid need to accept label prop for column headers.
interface ButtonProps {
  label?: string;
}

const kompassiIntegration = import.meta.env.VITE_ENABLE_KOMPASSI_INTEGRATION;

export const EventCreate = (props: CreateProps) => {
  return (
    <Create title="Luo tapahtuma" redirect="list" {...props}>
      <EventForm />
    </Create>
  );
}

const EventEditTitle = () => {
  const record = useRecordContext();
  if (!record) return null;
  return <span>{`Muokkaa tapahtumaa: ${record.name}`}</span>;
};

export const EventEdit = (props: EditProps) => {
  return (
    <Edit title={<EventEditTitle />} {...props} mutationMode='pessimistic'>
      <EventForm />
    </Edit>
  );
}

const EventForm = () => {
  return (
    <SimpleForm>
      <TextInput label="Nimi" source="name" validate={required()} sx={{ width: 400 }} />
      <TextInput
        label="Kuvaus"
        source="description"
        multiline
        rows={5}
        sx={{ width: '75%', maxWidth: 800 }}
      />
      <DateInput
        label="Alkupäivämäärä"
        source="startDate"
        helperText={<CalendarHelper />}
        sx={{ width: 400 }}
      />
      {kompassiIntegration && (<>
        <Divider sx={{ width: '100%', my: 3, borderColor: '#808080' }} />
        <NumberInput
          label="Kompassi-palvelun aktiviteettitunniste"
          source="integrationId"
          sx={{ width: 400 }}
        />
      </>)}
    </SimpleForm>
  );
}

export const EventList = (props: ListProps) => {

  const notify = useNotify();
  const notifyError = useCallback((msg: string) => notify(msg, { type: 'error' }), [notify]);
  const [state, setState] = useState(STATE.INITIAL);
  useAutoLogout();

  const goToCheckIn = async (id: number) => {
    setState(STATE.LOADING);
    successSound.volume = 0;
    successSound.play();
    successSound.pause();
    successSound.currentTime = 0;
    errorSound.volume = 0;
    errorSound.play();
    errorSound.pause();
    errorSound.currentTime = 0;
    successSound.volume = 1;
    errorSound.volume = 1;
    const response = await httpClient(api.spamGuard.getSecurityCode, {
      method: 'POST',
      body: JSON.stringify({
        targetId: id
      })
    });
    if (response.statusCode < 200 || response.statusCode >= 300) {
      notifyError('Virhe turvakoodin haussa');
    } else {
      //sessionStorage.setItem(checkInSecurityCodeKey, response.message);
      //document.location.hash = '#/checkIn';
    }
  }

  const OpenCheckInButton = (_props: ButtonProps) => {
    const record = useRecordContext<EventRecord>();
    if (!record) return null;
    return (
      <Button
        onClick={() => goToCheckIn(record.id)}
        size="small"
        variant="contained"
        disabled={!record.active || state === STATE.LOADING}
      >
        <CropFreeIcon />
        &nbsp;QR-lukija
      </Button>
    )
  }

  const OpenCheckInLogButton = (_props: ButtonProps) => {
    const record = useRecordContext<EventRecord>();
    if (!record) return null;
    return (
      <Button variant="contained" size="small" href={`#/eventLog/${record.id}`} ><ListIcon />&nbsp;Listaa</Button>
    );
  }

  return (
    <List title="Tapahtumat" exporter={false} pagination={false} {...props}>
      <Datagrid bulkActionButtons={false} rowClick={false}>
        <TextField label="Nimi" source="name" />
        <DateField label="Alkupäivämäärä" source="startDate" locales={['fi']} />
        <OpenCheckInButton label="Ilmoittautuminen" />
        <OpenCheckInLogButton label="Ilmoittautuneet" />
        <EditButton />
      </Datagrid>
    </List>
)};

