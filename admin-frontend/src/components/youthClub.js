import React, { useState, useCallback } from 'react';
import {
  List,
  Datagrid,
  TextField,
  useNotify
} from 'react-admin';
import Button from '@material-ui/core/Button';
import { successSound, errorSound } from '../audio/audio.js'
import { checkInClubIdKey, checkInSecurityCodeKey } from '../utils';
import ListIcon from '@material-ui/icons/List';
import PieChartIcon from '@material-ui/icons/PieChart';
import CropFreeIcon from '@material-ui/icons/CropFree';
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
        variant="contained"
        disabled={!props.record.active || state === STATE.LOADING}
      >
        <CropFreeIcon />
        &nbsp;Kirjautuminen
      </Button>
    )
  }

  const OpenCheckInStatsButton = (props) => (
    <Button variant="contained" href={`#/statistics/${props.record.id}`} ><PieChartIcon />&nbsp;Tilastot</Button>
  )

  const OpenCheckInLogButton = (props) => (
    <Button variant="contained" href={`#/log/${props.record.id}`} ><ListIcon />&nbsp;Kirjautumiset</Button>
  )

  return (
    <List title="Nuorisotilat" bulkActionButtons={false} exporter={false} pagination={false} {...props}>
      <Datagrid>
        <TextField label="Nimi" source="name" />
        <OpenCheckInButton />
        <OpenCheckInStatsButton />
        <OpenCheckInLogButton />
      </Datagrid>
    </List>
)};
