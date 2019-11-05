import React from 'react';
import { 
    List,
    Datagrid,
    TextField,
 } from 'react-admin';
 import Button from '@material-ui/core/Button';

const QrButton = (props) => (
  <Button variant="contained" href={`#/qr/${props.record.id}`} >Kirjautuminen</Button>
)

export const YouthClubList = (props) => {
  console.log(props)
  return(
  <List title="Nuorisotalot" {...props}>
      <Datagrid>
          <TextField label="Nimi" source="name" />
          <TextField label="Postinumero" source="postCode" />
          <QrButton />
      </Datagrid>
  </List>
)
  };