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
  NumberInput,
  ListProps,
  CreateProps
} from 'react-admin';
import { Card, CardContent } from '@mui/material';
import useAutoLogout from '../../hooks/useAutoLogout';

const CustomToolbar = (props: any) => (
  <Toolbar {...props}>
    <SaveButton disabled={props.pristine && !props.validating} />
  </Toolbar>
);

export const ExtraEntryTypeList = (props: ListProps) => {
  useAutoLogout();
  return (<>
    <Card>
      <CardContent>
        <p>Huomaa, että luotuja merkintätyyppejä ei toistaiseksi voi muokata eikä poistaa.</p>
      </CardContent>
    </Card>
    <List title="Merkintätyypit" exporter={false} pagination={false} {...props}>
      <Datagrid bulkActionButtons={false}>
        <TextField label="Merkintätyyppi" source="name" />
        <NumberField label="Yläikäraja" source="expiryAge" />
      </Datagrid>
    </List>
  </>);
}

export const ExtraEntryTypeCreate = (props: CreateProps) => {
  useAutoLogout();
  return (
    <Create title="Lisää merkintätyyppi" {...props} redirect="list">
      <SimpleForm toolbar={<CustomToolbar />}>
        <TextInput label="Merkintätyyppi" source="name" validate={required()} />
        <NumberInput label="Yläikäraja" source="expiryAge" validate={required()} />
      </SimpleForm>
    </Create>
  );
};

