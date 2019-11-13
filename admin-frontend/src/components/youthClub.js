import React from 'react';
import {
  List,
  Datagrid,
  TextField,
} from 'react-admin';
import Button from '@material-ui/core/Button';

const OpenCheckInButton = (props) => (
  <Button variant="contained" href={`#/checkIn/${props.record.id}`} >Kirjautuminen</Button>
)

const OpenLogBookButton = (props) => (
  <Button variant="contained" href={`#/logbook/${props.record.id}`} >Logbook</Button>
)

export const YouthClubList = (props) => (
  <List title="Nuorisotalot" {...props}>
    <Datagrid>
      <TextField label="Nimi" source="name" />
      <TextField label="Postinumero" source="postCode" />
      <OpenCheckInButton />
      <OpenLogBookButton />
    </Datagrid>
  </List>
);
