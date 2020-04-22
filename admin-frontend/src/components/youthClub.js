import React from 'react';
import {
  List,
  Datagrid,
  TextField,
} from 'react-admin';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import audio from "../audio/audio.js"

const prepareAudio = () => {
  audio.play()
  audio.pause()
  audio.currentTime = 0
}

const OpenCheckInButton = (props) => {
  return (
    <Link to={{
      pathname: `/checkIn/${props.record.id}`,
      state: {record: props.record}
    }}>
      <Button onClick={prepareAudio} variant="contained" >Kirjautuminen</Button>
    </Link>
)}

const OpenLogBookButton = (props) => (
  <Button variant="contained" href={`#/logbook/${props.record.id}`} >Logbook</Button>
)

const OpenLogBookCheckInsButton = (props) => (
  <Button variant="contained" href={`#/checkIns/${props.record.id}`} >Kirjautumiset</Button>
)

export const YouthClubList = (props) => (
  <List title="Nuorisotalot" bulkActionButtons={false} exporter={false} pagination={false} {...props}>
    <Datagrid>
      <TextField label="Nimi" source="name" />
      {/* <TextField label="Postinumero" source="postCode" /> */}
      <OpenCheckInButton />
      <OpenLogBookButton />
      <OpenLogBookCheckInsButton />
    </Datagrid>
  </List>
);
