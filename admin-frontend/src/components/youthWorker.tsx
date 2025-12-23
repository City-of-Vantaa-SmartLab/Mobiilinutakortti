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
import { getYouthClubOptions, getActiveYouthClubOptions, getAlertDialogObserver } from '../utils';
import useAutoLogout from '../hooks/useAutoLogout';

const useEntraID = !!import.meta.env.VITE_ENTRA_TENANT_ID;

export const YouthWorkerList = (props: ListProps) => {
  const [youthClubs, setYouthClubs] = useState([]);
  useEffect(() => {
    const addYouthClubsToState = async () => {
      const youthClubOptions = await getYouthClubOptions();
      setYouthClubs(youthClubOptions);
    };
    addYouthClubsToState();
  }, []);

  useAutoLogout();

  if (youthClubs.length === 0) {
    return null
  }

  return (
    <List title="Nuorisotyöntekijät" exporter={false} pagination={false} {...props} hasCreate={!useEntraID}>
      <Datagrid bulkActionButtons={false} rowClick={false}>
        <FunctionField label="Nimi" render={record => `${record.firstName}${useEntraID ? '' : (' ' + record.lastName)}`} />
        <TextField label="Sähköposti" source="email" />
        <SelectField label="Kotinuorisotila" source="mainYouthClub" choices={youthClubs} />
        <BooleanField label="Ylläpitäjä" source="isAdmin" />
        <EditButton />
      </Datagrid>
    </List>
  );
}

export const YouthWorkerCreate = (props: CreateProps) => {
  const [youthClubs, setYouthClubs] = useState([]);

  useEffect(() => {
    const addYouthClubsToState = async () => {
      const youthClubOptions = await getActiveYouthClubOptions();
      setYouthClubs(youthClubOptions);
    };
    addYouthClubsToState();
  }, []);

  useAutoLogout();

  return (
    <Create title="Rekisteröi nuorisotyöntekijä" {...props}>
      <SimpleForm variant="standard" margin="normal" redirect="list">
        <TextInput label="Sähköposti" source="email" type="email" validate={required()} />
        <TextInput label="Salasana" source="password" type="password" validate={required()} />
        <TextInput label="Etunimi" source="firstName" validate={required()} />
        <TextInput label="Sukunimi" source="lastName" validate={required()} />
        <SelectInput label="Kotinuorisotila" source="mainYouthClub" allowEmpty choices={youthClubs} />
        <BooleanInput label="Ylläpitäjä" source="isAdmin" defaultValue={false} />
      </SimpleForm>
    </Create>
  );
};

export const YouthWorkerEdit = (props: EditProps) => {
  const [youthClubs, setYouthClubs] = useState([]);

  useEffect(() => {
    const addYouthClubsToState = async () => {
      const youthClubOptions = await getYouthClubOptions();
      setYouthClubs(youthClubOptions.map(yc => {return {...yc, disabled: !yc.active}}))
    };
    addYouthClubsToState();
  }, []);

  useAutoLogout();

  useEffect(() => {
    const observer = getAlertDialogObserver('Poista nuorisotyöntekijä');
    return () => {
      observer.disconnect();
    }
  }, [])

  return (
    <Edit title="Muokkaa nuorisotyöntekijää" {...props} mutationMode="pessimistic">
      <SimpleForm variant="standard" margin="normal" redirect="list">
        <TextInput label="Sähköposti" source="email" type="email" disabled={useEntraID} />
        <TextInput label={useEntraID ? "Nimi" : "Etunimi"} source="firstName" disabled={useEntraID} />
        {!useEntraID && (<TextInput label="Sukunimi" source="lastName" />)}
        <SelectInput label="Kotinuorisotila" source="mainYouthClub" allowEmpty choices={youthClubs} />
        <BooleanInput label="Ylläpitäjä" source="isAdmin" disabled={useEntraID} />
      </SimpleForm>
    </Edit >
  );
};
