import React from 'react';
import { List, Datagrid, TextField, SelectField, NumberField, FunctionField } from 'react-admin';

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
