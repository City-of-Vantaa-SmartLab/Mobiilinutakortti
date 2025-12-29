import { useState, useEffect } from 'react';
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
  SelectField,
  ListProps,
  CreateProps,
  EditProps,
  TopToolbar,
  CreateButton
} from 'react-admin';
import { getYouthClubOptions, getActiveYouthClubOptions, getAlertDialogObserver } from '../utils';
import useAutoLogout from '../hooks/useAutoLogout';

const useEntraID = !!import.meta.env.VITE_ENTRA_TENANT_ID;

// If using Entra ID, adding youth workers is done automatically when they sign in.
const YouthWorkerListActions = () => (
  <TopToolbar>
    {!useEntraID && <CreateButton />}
  </TopToolbar>
);

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
    <List title="Nuorisotyöntekijät" exporter={false} pagination={false} actions={<YouthWorkerListActions />} {...props}>
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
    <Create title="Rekisteröi nuorisotyöntekijä" redirect="list" {...props}>
      <SimpleForm>
        <TextInput label="Sähköposti" source="email" type="email" validate={required()} />
        <TextInput label="Salasana" source="password" type="password" validate={required()} />
        <TextInput label="Etunimi" source="firstName" validate={required()} />
        <TextInput label="Sukunimi" source="lastName" validate={required()} />
        <SelectInput label="Kotinuorisotila" source="mainYouthClub" parse={v => v === '' ? null : v} choices={youthClubs} />
        <BooleanInput label="Ylläpitäjä" source="isAdmin" defaultValue={false} />
      </SimpleForm>
    </Create>
  );
};

export const YouthWorkerEdit = (props: EditProps) => {
  const [youthClubs, setYouthClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const addYouthClubsToState = async () => {
      const youthClubOptions = await getYouthClubOptions();
      setYouthClubs(youthClubOptions.map((yc: any) => {return {...yc, disabled: !yc.active}}))
      setLoading(false);
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

  if (loading) {
    return null;
  }

  return (
    <Edit title="Muokkaa nuorisotyöntekijää" redirect="list" {...props} mutationMode="pessimistic">
      <SimpleForm>
        <TextInput label="Sähköposti" source="email" type="email" disabled={useEntraID} />
        <TextInput label={useEntraID ? "Nimi" : "Etunimi"} source="firstName" disabled={useEntraID} />
        {!useEntraID && (<TextInput label="Sukunimi" source="lastName" />)}
        <SelectInput label="Kotinuorisotila" source="mainYouthClub" parse={v => v === '' ? null : v} choices={youthClubs} />
        <BooleanInput label="Ylläpitäjä" source="isAdmin" disabled={useEntraID} />
      </SimpleForm>
    </Edit >
  );
};
