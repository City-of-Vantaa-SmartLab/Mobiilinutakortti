import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  Create,
  SimpleForm,
  TextInput,
  required,
  Toolbar,
  SaveButton,
  NumberField,
  NumberInput
} from 'react-admin';
import useAutoLogout from '../../hooks/useAutoLogout';

const CustomToolbar = (props) => (
  <Toolbar {...props}>
    <SaveButton disabled={props.pristine && !props.validating} />
  </Toolbar>
);

export const ExtraEntryTypeList = (props) => {
  useAutoLogout();
  return (
    <List title="Merkintätyypit" bulkActionButtons={false} exporter={false} pagination={false} {...props}>
      <Datagrid>
        <TextField label="Merkintätyyppi" source="name" />
        <NumberField label="Yläikäraja" source="expiryAge" />
      </Datagrid>
    </List>
  );
}

export const ExtraEntryTypeCreate = (props) => {
  useAutoLogout();
  return (
    <Create title="Lisää merkintätyyppi" {...props}>
      <SimpleForm variant="standard" margin="normal" redirect="list" toolbar={<CustomToolbar />}>
        <TextInput label="Merkintätyyppi" source="name" validate={required()} />
        <NumberInput label="Yläikäraja" source="expiryAge" validate={required()} />
      </SimpleForm>
    </Create>
  );
};

