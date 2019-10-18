import React from 'react';
import { 
    List,
    Datagrid,
    TextField,
    SelectField,
    NumberField,
    FunctionField,
    Create,
    TabbedForm,
    FormTab, 
    TextInput,
    SelectInput,
    NumberInput,
    required,
    number,
    choices
 } from 'react-admin';

const genderChoices = [
    { id: 'm', name: 'Mies' },
    { id: 'f', name: 'Nainen' },
    { id: 'o', name: 'Muu' }
];

export const JuniorList = (props) => (
    <List {...props}>
        <Datagrid>
            <TextField label="Puhelinnumero" source="phoneNumber" />
            <FunctionField label="Nimi" render={record => `${record.firstName} ${record.lastName}`} />
            <SelectField label="Sukupuoli" source="gender" choices={genderChoices} />
            <NumberField label="Ikä" source="age" />
            <TextField label="Kotinuorisotalo" source="homeYouthClub" />
            <TextField label="Postinumero" source="postCode" />
            <TextField label="Huoltajan nimi" source="parentsName" />
            <TextField label="Huoltajan puhelinnumero" source="parentsPhoneNumber" />
        </Datagrid>
    </List>
);
export const JuniorCreate = (props) => (
    <Create {...props}>
        <TabbedForm>
            <FormTab label="Junior">
                <TextInput label="Puhelinnumero" source="phoneNumber" validate={ required() }/>
                <TextInput label="Sukunimi" source="lastName" validate={ required() }/>
                <TextInput label="Etunimi" source="firstName" validate={ required() }/>
                <SelectInput label="Sukupuoli" source="gender" choices={ genderChoices } validate={ [required(), choices(['m', 'f', 'o'])] } />
                <NumberInput label="Ikä" source="age" validate={ [required(), number()] }/>
                <TextInput label="Kotinuorisotalo" source="homeYouthClub" validate={ required() }/>
                <TextInput label="Postinumero" source="postCode" validate={ required() }/>
            </FormTab>
            <FormTab label="Parent">
                <TextInput label="Huoltajan nimi" source="parentsName" validate={ required() }/>
                <TextInput label="Huoltajan puhelinnumero" source="parentsPhoneNumber" validate={ required() }/>
            </FormTab>
        </TabbedForm>
    </Create>
);