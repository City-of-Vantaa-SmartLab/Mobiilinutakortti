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
import { getYouthClubs } from '../utils';

export const YouthWorkerList = (props) => {
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
    <List title="Nuorisotyöntekijät" bulkActionButtons={false} exporter={false} pagination={false} {...props}>
      <Datagrid>
        <FunctionField label="Nimi" render={record => `${record.firstName} ${record.lastName}`} />
        <TextField label="Sähköposti" source="email" />
        <SelectField label="Kotinuorisotila" source="mainYouthClub" choices={youthClubs} />
        <BooleanField label="Ylläpitäjä" source="isSuperUser" />
        <EditButton />
      </Datagrid>
    </List>
  );
}

export const YouthWorkerCreate = (props) => {
  const [youthClubs, setYouthClubs] = useState([]);
  useEffect(() => {
    const addYouthClubsToState = async () => {
      const parsedYouthClubs = await getYouthClubs();
      setYouthClubs(parsedYouthClubs);
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
        <SelectInput label="Kotinuorisotila" source="mainYouthClub" allowEmpty choices={youthClubs} />
        <BooleanInput label="Ylläpitäjä" source="isSuperUser" defaultValue={false} />
      </SimpleForm>
    </Create>
  );
};

export const YouthWorkerEdit = (props) => {
  const [youthClubs, setYouthClubs] = useState([]);
  useEffect(() => {
    const addYouthClubsToState = async () => {
        const parsedYouthClubs = await getYouthClubs();
        setYouthClubs(parsedYouthClubs);
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
        <TextInput label="Sähköposti" source="email" type="email" />
        <TextInput label="Etunimi" source="firstName" />
        <TextInput label="Sukunimi" source="lastName" />
        <SelectInput label="Kotinuorisotila" source="mainYouthClub" allowEmpty choices={youthClubs} />
        <BooleanInput label="Ylläpitäjä" source="isSuperUser" />
      </SimpleForm>
    </Edit >
  );
};
