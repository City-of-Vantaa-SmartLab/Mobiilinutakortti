import React from 'react';
import { List, Datagrid, TextField, SelectField, NumberField, FunctionField, EditButton, Create, SimpleForm, TextInput, SelectInput, NumberInput, Edit, DisabledInput } from 'react-admin';

const genderChoices = [
    { id: 'm', name: 'Mies' },
    { id: 'f', name: 'Nainen' },
    { id: 'o', name: 'Muut' }
];

export const JuniorList = (props) => (
    <List {...props} >
        <Datagrid>
            <TextField label="Puhelinnumero" source="phoneNumber" />
            <FunctionField label="Nimi" render={record => `${record.firstName} ${record.lastName}`} />
            <SelectField label="Sukupuoli" source="gender" choices={genderChoices} />
            <NumberField label="Ikä" source="age" />
            <TextField label="Kotinuorisotalo Multioption" source="homeYouthClub" />
            <TextField label="Postinumero" source="postCode" />
            <TextField label="Huoltajan nimi" source="parentsName" />
            <TextField label="Huoltajan puhelinnumero" source="parentsPhoneNumber" />
            <EditButton />
        </Datagrid>
    </List>
);

export const JuniorCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput label="Puhelinnumero" source="phoneNumber" />
            <TextInput label="Sukunimi" source="lastName" />
            <TextInput label="Etunimi" source="firstName" />
            <SelectInput label="Sukupuoli" source="gender" choices={genderChoices} />
            <NumberInput label="Ikä" source="age" />
            <TextInput label="Kotinuorisotalo Multioption" source="homeYouthClub" />
            <TextInput label="Postinumero" source="postCode" />
            <TextInput label="Huoltajan nimi" source="parentsName" />
            <TextInput label="Huoltajan puhelinnumero" source="parentsPhoneNumber" />
        </SimpleForm>
    </Create>
);

export const JuniorEdit = (props) => (
    <Edit {...props}>
        <SimpleForm>
            <DisabledInput label="Id" source="id" />
            <TextInput label="Puhelinnumero" source="phoneNumber" />
            <TextInput label="Sukunimi" source="lastName" />
            <TextInput label="Etunimi" source="firstName" />
            <SelectInput label="Sukupuoli" source="gender" choices={genderChoices} />
            <NumberInput label="Ikä" source="age" />
            <TextInput label="Kotinuorisotalo Multioption" source="homeYouthClub" />
            <TextInput label="Postinumero" source="postCode" />
            <TextInput label="Huoltajan nimi" source="parentsName" />
            <TextInput label="Huoltajan puhelinnumero" source="parentsPhoneNumber" />
        </SimpleForm>
    </Edit>
);