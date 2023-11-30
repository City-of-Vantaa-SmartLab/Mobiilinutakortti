import React, { useState, useEffect } from 'react';
import {
  List,
  Datagrid,
  TextField,
  FunctionField,
  BooleanField,
  BooleanInput,
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  required,
  EditButton,
  Edit,
  SelectField
} from 'react-admin';
import { getYouthClubs, getActiveYouthClubs } from '../utils';

export const YouthWorkerList = (props) => {
  const useEntraID = !!process.env.REACT_APP_ENTRA_TENANT_ID;
  const [youthClubs, setYouthClubs] = useState([]);
  useEffect(() => {
    const addYouthClubsToState = async () => {
      const parsedYouthClubs = await getYouthClubs();
      setYouthClubs(parsedYouthClubs);
    };
    addYouthClubsToState();
  }, []);

  if (youthClubs.length === 0) {
    return null
  }

  return (
    <List title="Nuorisotyöntekijät" bulkActionButtons={false} exporter={false} pagination={false} {...props} hasCreate={!useEntraID}>
      <Datagrid>
        <FunctionField label="Nimi" render={record => `${record.firstName} ${record.lastName}`} />
        <TextField label="Sähköposti" source="email" />
        <SelectField label="Kotinuorisotila" source="mainYouthClub" choices={youthClubs} />
        <BooleanField label="Ylläpitäjä" source="isAdmin" />
        <EditButton />
      </Datagrid>
    </List>
  );
}

export const YouthWorkerCreate = (props) => {
  const [youthClubChoices, setYouthClubChoices] = useState([]);

  useEffect(() => {
    const addYouthClubsToState = async () => {
      const parsedYouthClubs = await getActiveYouthClubs();
      setYouthClubChoices(parsedYouthClubs);
    };
    addYouthClubsToState();
  }, []);

  return (
    <Create title="Rekisteröi nuorisotyöntekijä" {...props}>
      <SimpleForm variant="standard" margin="normal" redirect="list">
        <TextInput label="Sähköposti" source="email" type="email" validate={required()} />
        <TextInput label="Salasana" source="password" type="password" validate={required()} />
        <TextInput label="Etunimi" source="firstName" validate={required()} />
        <TextInput label="Sukunimi" source="lastName" validate={required()} />
        <SelectInput label="Kotinuorisotila" source="mainYouthClub" allowEmpty choices={youthClubChoices} />
        <BooleanInput label="Ylläpitäjä" source="isAdmin" defaultValue={false} />
      </SimpleForm>
    </Create>
  );
};

export const YouthWorkerEdit = (props) => {
  const useEntraID = !!process.env.REACT_APP_ENTRA_TENANT_ID;
  const [youthClubChoices, setYouthClubChoices] = useState([]);

  useEffect(() => {
    const addYouthClubsToState = async () => {
      const youthClubs = await getYouthClubs();
      setYouthClubChoices(youthClubs.map(yc => {return {...yc, disabled: !yc.active}}))
    };
    addYouthClubsToState();
  }, []);

  useEffect(() => {
    const targetNode = document;
    const config = { attributes: true, childList: false, subtree: true };

    const checkTitles = () => {
      const title = document.getElementById('alert-dialog-title');
      if (title) {
        title.getElementsByTagName("h2")[0].innerHTML = 'Poista nuorisotyöntekijä';
      }
    };
    const observer = new MutationObserver(checkTitles);
    observer.observe(targetNode, config);

    return () => {
      observer.disconnect();
    }
  }, [])

  return (
    <Edit title="Muokkaa nuorisotyöntekijää" {...props} undoable={false}>
      <SimpleForm variant="standard" margin="normal" redirect="list">
        <TextInput label="Sähköposti" source="email" type="email" disabled={useEntraID} />
        <TextInput label="Etunimi" source="firstName" disabled={useEntraID} />
        <TextInput label="Sukunimi" source="lastName" disabled={useEntraID} />
        <SelectInput label="Kotinuorisotila" source="mainYouthClub" allowEmpty choices={youthClubChoices} />
        <BooleanInput label="Ylläpitäjä" source="isAdmin" disabled={useEntraID} />
      </SimpleForm>
    </Edit >
  );
};
