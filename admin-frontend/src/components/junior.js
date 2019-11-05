import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    SelectField,
    DateField,
    FunctionField,
    Create,
    SimpleForm,
    TextInput,
    SelectInput,
    DateInput,
    required,
    choices,
    EditButton,
    Edit,

} from 'react-admin';
import { ageValidator } from '../utils'

const genderChoices = [
    { id: 'm', name: 'Mies' },
    { id: 'f', name: 'Nainen' },
    { id: 'o', name: 'Muu' }
];

const JuniorEditTitle = ({ record }) => (
    <span>{`Muokkaa ${record.firstName} ${record.lastName}`}</span>
);

export const JuniorList = (props) => (
    <List title="Nuoret" {...props}>
        <Datagrid>
            <FunctionField label="Nimi" render={record => `${record.firstName} ${record.lastName}`} />
            <SelectField label="Sukupuoli" source="gender" choices={genderChoices} />
            <DateField label="Syntymäaika" source="birthdayTimestamp" />
            <TextField label="Puhelinnumero" source="phoneNumber" />
            <TextField label="Postinumero" source="postCode" />
            <TextField label="Kotinuorisotalo" source="homeYouthClub" />
            <TextField label="Huoltajan nimi" source="parentsName" />
            <TextField label="Huoltajan puhelinnumero" source="parentsPhoneNumber" />
            <EditButton />
        </Datagrid>
    </List>
);
export const JuniorCreate = (props) => (
    <Create title="Rekisteröi nuori" {...props}>
        <SimpleForm redirect="list">
            <TextInput label="Etunimi" source="firstName" validate={required()} />
            <TextInput label="Sukunimi" source="lastName" validate={required()} />
            <SelectInput label="Sukupuoli" source="gender" choices={genderChoices} validate={[required(), choices(['m', 'f', 'o'])]} />
            <DateInput label="Syntymäaika" source="birthdayTimestamp" validate={[required(), ageValidator()]} />
            <TextInput label="Puhelinnumero" source="phoneNumber" validate={required()} />
            <TextInput label="Postinumero" source="postCode" validate={required()} />
            <TextInput label="Kotinuorisotalo" source="homeYouthClub" validate={required()} />
            <TextInput label="Huoltajan nimi" source="parentsName" validate={required()} />
            <TextInput label="Huoltajan puhelinnumero" source="parentsPhoneNumber" validate={required()} />
        </SimpleForm>
    </Create>
);
export const JuniorEdit = (props) => (
    <Edit title={<JuniorEditTitle />} {...props} undoable={false}>
        <SimpleForm>
            <TextInput label="Etunimi" source="firstName" />
            <TextInput label="Sukunimi" source="lastName" />
            <SelectInput label="Sukupuoli" source="gender" choices={genderChoices} />
            <DateInput label="Syntymäaika" source="birthdayTimestamp" validate={[required(), ageValidator]} />
            <TextInput label="Puhelinnumero" source="phoneNumber" />
            <TextInput label="Postinumero" source="postCode" />
            <TextInput label="Kotinuorisotalo" source="homeYouthClub" />
            <TextInput label="Huoltajan nimi" source="parentsName" />
            <TextInput label="Huoltajan puhelinnumero" source="parentsPhoneNumber" />
        </SimpleForm>
    </Edit>
);