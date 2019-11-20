import React, { useState, useEffect } from 'react';
import {
    List,
    Datagrid,
    TextField,
    SelectField,
    DateField,
    Create,
    SimpleForm,
    TextInput,
    SelectInput,
    DateInput,
    required,
    choices,
    EditButton,
    Edit,
    Filter
} from 'react-admin';
import { getYouthClubs, ageValidator, genderChoices } from '../utils'

const JuniorEditTitle = ({ record }) => (
    <span>{`Muokkaa ${record.firstName} ${record.lastName}`}</span>
);

export const JuniorList = (props) => {

    const [youthClubs, setYouthClubs] = useState([]);
    useEffect(() => {
        const addYouthClubsToState = async () => {
            const parsedYouthClubs = await getYouthClubs();
            setYouthClubs(parsedYouthClubs);
        };
        addYouthClubsToState();
    }, []);

    const JuniorFilter = (props) => (
        <Filter {...props}>
            <TextInput label="Nimi" source="name" />
            <SelectInput label="Kotinuorisotalo" source="homeYouthClub" choices={youthClubs} />
        </Filter>
    );

    return (
        <List title="Nuoret" filters={<JuniorFilter />} bulkActionButtons={false} exporter={false} {...props}>
            <Datagrid>
                <TextField label="Nimi" source="displayName" />
                <SelectField label="Sukupuoli" source="gender" choices={genderChoices} />
                <DateField label="Syntymäaika" source="birthday" />
                <TextField label="Puhelinnumero" source="phoneNumber" />
                <TextField label="Postinumero" source="postCode" />
                <TextField label="Kotinuorisotalo" source="homeYouthClub" />
                <TextField label="Huoltajan nimi" source="parentsName" />
                <TextField label="Huoltajan puhelinnumero" source="parentsPhoneNumber" />
                <EditButton />
            </Datagrid>
        </List>
    )
};

export const JuniorCreate = (props) => {
    const [youthClubs, setYouthClubs] = useState([]);
    useEffect(() => {
        const addYouthClubsToState = async () => {
            const parsedYouthClubs = await getYouthClubs();
            setYouthClubs(parsedYouthClubs);
        };
        addYouthClubsToState();
    }, []);

    return (
        <Create title="Rekisteröi nuori" {...props}>
            <SimpleForm redirect="list">
                <TextInput label="Etunimi" source="firstName" validate={required()} />
                <TextInput label="Sukunimi" source="lastName" validate={required()} />
                <TextInput label="Nimimerkki" source="nickName" />
                <SelectInput label="Sukupuoli" source="gender" choices={genderChoices} validate={[required(), choices(['m', 'f', 'o'])]} />
                <DateInput label="Syntymäaika" source="birthday" validate={[required(), ageValidator]} />
                <TextInput label="Puhelinnumero" source="phoneNumber" validate={required()} />
                <TextInput label="Postinumero" source="postCode" validate={required()} />
                <SelectInput label="Kotinuorisotalo" source="homeYouthClub" choices={youthClubs} validate={required()} />
                <TextInput label="Huoltajan nimi" source="parentsName" validate={required()} />
                <TextInput label="Huoltajan puhelinnumero" source="parentsPhoneNumber" validate={required()} />
            </SimpleForm>
        </Create>
    );

}

export const JuniorEdit = (props) => {
    const [youthClubs, setYouthClubs] = useState([]);
    useEffect(() => {
        const addYouthClubsToState = async () => {
            const parsedYouthClubs = await getYouthClubs();
            setYouthClubs(parsedYouthClubs);
        };
        addYouthClubsToState();
    }, []);

    return (
        <Edit title={<JuniorEditTitle />} {...props} undoable={false}>
            <SimpleForm>
                <TextInput label="Etunimi" source="firstName" />
                <TextInput label="Sukunimi" source="lastName" />
                <TextInput label="Nimimerkki" source="nickName" />
                <SelectInput label="Sukupuoli" source="gender" choices={genderChoices} />
                <DateInput label="Syntymäaika" source="birthday" validate={ageValidator} />
                <TextInput label="Puhelinnumero" source="phoneNumber" />
                <TextInput label="Postinumero" source="postCode" />
                <SelectInput label="Kotinuorisotalo" source="homeYouthClub" choices={youthClubs} />
                <TextInput label="Huoltajan nimi" source="parentsName" />
                <TextInput label="Huoltajan puhelinnumero" source="parentsPhoneNumber" />
            </SimpleForm>
        </Edit>
    );
}
