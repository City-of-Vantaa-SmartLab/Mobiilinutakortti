import React, { useState, useCallback } from 'react';
import {
  List,
  Datagrid,
  TextField,
  useNotify
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

export const YouthClubList = (props) => {

  const notify = useNotify();
  const notifyError = useCallback((msg) => notify(msg, 'error'), [notify]);
  const [state, setState] = useState(STATE.INITIAL);
  useAutoLogout();

  const goToCheckIn = async (id) => {
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
    sessionStorage.setItem(checkInClubIdKey, id);
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

  const OpenCheckInButton = (props) => {
    return (
      <Button
        onClick={() => goToCheckIn(props.record.id)}
        size="small"
        variant="contained"
        disabled={!props.record.active || state === STATE.LOADING}
      >
        <CropFreeIcon />
        &nbsp;QR-lukija
      </Button>
    )
  }

  const OpenCheckInStatsButton = (props) => (
    <Button variant="contained" size="small" href={`#/statistics/${props.record.id}`} ><PieChartIcon />&nbsp;Näytä</Button>
  )

  const OpenCheckInLogButton = (props) => (
    <Button variant="contained" size="small" href={`#/log/${props.record.id}`} ><ListIcon />&nbsp;Listaa</Button>
  )

  return (
    <List title="Nuorisotilat" bulkActionButtons={false} exporter={false} pagination={false} {...props}>
      <Datagrid>
        <TextField label="Nimi" source="name" />
        <OpenCheckInButton label="Kirjautuminen" />
        <OpenCheckInStatsButton label="Tilastot" />
        <OpenCheckInLogButton label="Kirjautumiset" />
      </Datagrid>
    </List>
)};
