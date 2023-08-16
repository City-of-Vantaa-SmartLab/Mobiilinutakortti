import React from 'react';
import {
  List,
  Datagrid,
  TextField,
} from 'react-admin';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { successSound, errorSound } from "../audio/audio.js"

const prepareCheckIn = (id) => {
  successSound.volume = 0;
  successSound.play();
  successSound.pause();
  successSound.currentTime = 0;
  errorSound.volume = 0;
  errorSound.play();
  errorSound.pause();
  errorSound.currentTime = 0;
  sessionStorage.setItem("initialCheckIn", id);
  sessionStorage.setItem("facingMode", "user");
  successSound.volume = 1;
  errorSound.volume = 1;
}

const prepareCheckIn2 = (id) => {
  successSound.volume = 0;
  successSound.play();
  successSound.pause();
  successSound.currentTime = 0;
  errorSound.volume = 0;
  errorSound.play();
  errorSound.pause();
  errorSound.currentTime = 0;
  sessionStorage.setItem("initialCheckIn", id);
  sessionStorage.setItem("facingMode", "environment");
  successSound.volume = 1;
  errorSound.volume = 1;
}

const OpenCheckInButton = (props) => {
  return (
    <Link to={{
      pathname: `/checkIn/${props.record.id}`,
      state: {record: props.record}
    }}>
      <Button onClick={() => prepareCheckIn(props.record.id)} variant="contained" >Kirjautuminen etukameralla</Button>
      <Button onClick={() => prepareCheckIn2(props.record.id)} variant="contained" >Kirjautuminen takakameralla</Button>
    </Link>
)}

const OpenLogBookButton = (props) => (
  <Button variant="contained" href={`#/logbook/${props.record.id}`} >Logbook</Button>
)

const OpenLogBookCheckInsButton = (props) => (
  <Button variant="contained" href={`#/checkIns/${props.record.id}`} >Kirjautumiset</Button>
)

export const YouthClubList = (props) => (
  <List title="Nuorisotilat" bulkActionButtons={false} exporter={false} pagination={false} {...props}>
    <Datagrid>
      <TextField label="Nimi" source="name" />
      {/* <TextField label="Postinumero" source="postCode" /> */}
      <OpenCheckInButton />
      <OpenLogBookButton />
      <OpenLogBookCheckInsButton />
    </Datagrid>
  </List>
);
