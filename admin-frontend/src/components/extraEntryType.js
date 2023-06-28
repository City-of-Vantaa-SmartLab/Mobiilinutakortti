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
  SaveButton
} from 'react-admin';

const CustomToolbar = (props) => (
  <Toolbar {...props}>
    <SaveButton disabled={props.pristine && !props.validating} />
  </Toolbar>
);

export const ExtraEntryList = (props) => {
  return (
    <List title="Merkintätyypit" bulkActionButtons={false} exporter={false} pagination={false} {...props}>
      <Datagrid>
        <TextField label="Merkintätyyppi" source="title" />
        <TextField label="Yläikäraja" source="expiryAge" />
      </Datagrid>
    </List>
  );
}

export const ExtraEntryCreate = (props) => {
  return (
    <Create title="Lisää merkintätyyppi" {...props}>
      <SimpleForm variant="standard" margin="normal" redirect="list" toolbar={<CustomToolbar />}>
        <TextInput label="Merkintätyyppi" source="title" validate={required()} />
        <TextInput label="Yläikäraja" source="expiryAge" validate={required()} />
      </SimpleForm>
    </Create>
  );
};

