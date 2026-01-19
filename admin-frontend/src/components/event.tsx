import { useState } from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
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
  BooleanInput,
  required
} from 'react-admin';
import { Divider, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { successSound, errorSound } from '../audio/audio.js'
import ListIcon from '@mui/icons-material/List';
import CropFreeIcon from '@mui/icons-material/CropFree';
import useAutoLogout from '../hooks/useAutoLogout';
import { STATE } from '../state';
import { CalendarHelper } from './calendarHelper';
import CheckInPopup from './checkIn/checkInPopup';

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
const enableExtraEntries = import.meta.env.VITE_ENABLE_EXTRA_ENTRIES;

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
      {enableExtraEntries && (<>
        <BooleanInput
          label="Osallistuminen on luvanvaraista"
          source="needsPermit"
          defaultValue={false}
          sx={{ mt: 2 }}
          helperText={false}
        />
        <Typography sx={{ width: '100%', fontSize: 'small' }}>
          Osallistumisen luvanvaraisuus luo Nutakorttiin tapahtumaa vastaavan uuden merkintätyypin. Nuorella tulee olla kyseistä merkintätyyppiä vastaava lupa kirjautuessaan sisään tapahtumaan. Voit muokata nuoren lupia <a href="#/extraEntry">Lisämerkinnät</a>-sivulta. Luvanvaraisuutta ei voi poistaa jos nuorille on jo myönnetty tapahtumaan lupia. Poista tällöin ensin luvat nuorilta tai koko tapahtuma.
        </Typography>
      </>)}
      {kompassiIntegration && (<>
        <Divider sx={{ width: '100%', my: 3, borderColor: '#808080' }} />
        <NumberInput
          label="Kompassi-palvelun toimintatunniste"
          source="integrationId"
          sx={{ width: 400 }}
          helperText={false}
        />
        <Typography sx={{ width: '100%', fontSize: 'small', mt: '1rem' }}>
          Näet toimintatunnisteen helpoiten kun navigoit Kompassi-palvelussa muokkaamaan toimintaa. Tällöin selaimen osoitepalkissa näkyy esimerkiksi polku: /group/123/activities/4567. Tässä esimerkkitapauksessa toimintatunniste olisi: 4567
        </Typography>
      </>)}
    </SimpleForm>
  );
}

export const EventList = (props: ListProps) => {

  const [state, setState] = useState(STATE.INITIAL);
  const [showCheckInPopup, setShowCheckInPopup] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
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
    setSelectedEventId(id);
    setShowCheckInPopup(true);
    setState(STATE.INITIAL);
  }

  const closeCheckInPopup = () => {
    setShowCheckInPopup(false);
    setSelectedEventId(null);
  }

  const OpenCheckInButton = (_props: ButtonProps) => {
    const record = useRecordContext<EventRecord>();
    if (!record) return null;
    return (
      <Button
        onClick={() => goToCheckIn(record.id)}
        size="small"
        variant="contained"
        disabled={state === STATE.LOADING}
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
      {showCheckInPopup && selectedEventId !== null && (
        <CheckInPopup eventId={selectedEventId} onClose={closeCheckInPopup} />
      )}
    </List>
)};

