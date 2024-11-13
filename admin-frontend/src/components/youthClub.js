import React from 'react';
import {
  List,
  Datagrid,
  TextField,
} from 'react-admin';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { successSound, errorSound } from '../audio/audio.js'
import { checkInClubId } from '../utils';
import ListIcon from '@material-ui/icons/List';
import PieChartIcon from '@material-ui/icons/PieChart';
import CropFreeIcon from '@material-ui/icons/CropFree';

const prepareCheckIn = (id) => {
  successSound.volume = 0;
  successSound.play();
  successSound.pause();
  successSound.currentTime = 0;
  errorSound.volume = 0;
  errorSound.play();
  errorSound.pause();
  errorSound.currentTime = 0;
  sessionStorage.setItem(checkInClubId, id);
  successSound.volume = 1;
  errorSound.volume = 1;
}

const OpenCheckInButton = (props) => {
  return (
    <Link to={{
      pathname: `/checkIn/${props.record.id}`,
      state: {record: props.record}
    }}
      style={{
        pointerEvents: !props.record.active ? "none": "auto"
      }}
    >
      <Button onClick={() => prepareCheckIn(props.record.id)} variant="contained" disabled={!props.record.active}><CropFreeIcon />&nbsp;Kirjautuminen</Button>
    </Link>
  )
}

const OpenLogBookButton = (props) => (
  <Button variant="contained" href={`#/logbook/${props.record.id}`} ><PieChartIcon />&nbsp;Logbook</Button>
)

const OpenCheckInsButton = (props) => (
  <Button variant="contained" href={`#/checkIns/${props.record.id}`} ><ListIcon />&nbsp;Kirjautumiset</Button>
)

export const YouthClubList = (props) => (
  <List title="Nuorisotilat" bulkActionButtons={false} exporter={false} pagination={false} {...props}>
    <Datagrid>
      <TextField label="Nimi" source="name" />
      {/* <TextField label="Postinumero" source="postCode" /> */}
      <OpenCheckInButton />
      <OpenLogBookButton />
      <OpenCheckInsButton />
    </Datagrid>
  </List>
);
