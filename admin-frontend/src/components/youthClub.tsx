import { useState, useCallback } from 'react';
import {
  List,
  Datagrid,
  TextField,
  useNotify,
  ListProps,
  useRecordContext
} from 'react-admin';
import Button from '@mui/material/Button';
import { successSound, errorSound } from '../audio/audio.js'
import { checkInClubIdKey, checkInSecurityCodeKey } from '../utils';
import ListIcon from '@mui/icons-material/List';
import PieChartIcon from '@mui/icons-material/PieChart';
import CropFreeIcon from '@mui/icons-material/CropFree';
import useAutoLogout from '../hooks/useAutoLogout';
import { httpClient } from '../httpClients/httpClient.js';
import api from '../api.js';
import { STATE } from '../state';

interface YouthClubRecord {
  id: number;
  name: string;
  active: boolean;
}

// Custom button components in Datagrid need to accept label prop for column headers.
interface ButtonProps {
  label?: string;
}

export const YouthClubList = (props: ListProps) => {

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
    sessionStorage.setItem(checkInClubIdKey, id.toString());
    const response = await httpClient(api.spamGuard.getSecurityCode, {
      method: 'POST',
      body: JSON.stringify({
        clubId: id
      })
    });
    if (response.statusCode < 200 || response.statusCode >= 300) {
      notifyError('Virhe turvakoodin haussa');
    } else {
      sessionStorage.setItem(checkInSecurityCodeKey, response.message);
      document.location.hash = '#/checkIn';
    }
  }

  const OpenCheckInButton = (_props: ButtonProps) => {
    const record = useRecordContext<YouthClubRecord>();
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

  const OpenCheckInStatsButton = (_props: ButtonProps) => {
    const record = useRecordContext<YouthClubRecord>();
    if (!record) return null;
    return (
      <Button variant="contained" size="small" href={`#/statistics/${record.id}`} ><PieChartIcon />&nbsp;Näytä</Button>
    );
  }

  const OpenCheckInLogButton = (_props: ButtonProps) => {
    const record = useRecordContext<YouthClubRecord>();
    if (!record) return null;
    return (
      <Button variant="contained" size="small" href={`#/log/${record.id}`} ><ListIcon />&nbsp;Listaa</Button>
    );
  }

  return (
    <List title="Nuorisotilat" exporter={false} pagination={false} {...props}>
      <Datagrid bulkActionButtons={false}>
        <TextField label="Nimi" source="name" />
        <OpenCheckInButton label="Kirjautuminen" />
        <OpenCheckInStatsButton label="Tilastot" />
        <OpenCheckInLogButton label="Kirjautumiset" />
      </Datagrid>
    </List>
)};
