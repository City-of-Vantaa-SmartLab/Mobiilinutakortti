import {
  List,
  Datagrid,
  TextField,
  Create,
  SimpleForm,
  TextInput,
  required,
  NumberField,
  NumberInput,
  ListProps,
  CreateProps
} from 'react-admin';
import { Card, CardContent } from '@mui/material';
import useAutoLogout from '../../hooks/useAutoLogout';
import { CustomBasicToolbar } from '../styledComponents';

export const ExtraEntryTypeList = (props: ListProps) => {
  useAutoLogout();
  return (<>
    <Card sx={{ marginTop: 2 }}>
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
      <SimpleForm toolbar={<CustomBasicToolbar listPath="/extraEntryType" />}>
        <TextInput label="Merkintätyyppi" source="name" validate={required()} />
        <NumberInput label="Yläikäraja" source="expiryAge" validate={required()} />
      </SimpleForm>
    </Create>
  );
};

