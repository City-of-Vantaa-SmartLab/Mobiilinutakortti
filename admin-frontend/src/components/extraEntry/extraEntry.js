import React, { useEffect, useState } from 'react';
import {
    List,
    Datagrid,
    EditButton,
    TextField,
    SelectField,
    Create,
    SimpleForm,
    TextInput,
    SelectInput,
    required,
    Filter,
    Pagination,
    DateInput,
    useRedirect
} from 'react-admin';
import { ageValidator, getExtraTypeLabel, getExtraEntryTypes } from '../../utils';

import { useRecordContext } from 'react-admin';

const CustomEditButton = () => {
    const record = useRecordContext();
    const redirect = useRedirect();

    const redirectToEdit = () => {
        const juniorId = record.id;
        redirect(`/junior/${juniorId}`)
    };
    return <EditButton onClick={redirectToEdit}/>;
}

export const ExtraEntryList = (props) => {
    // const test = await getExtraTypeLabel(1)
    // console.log('test', test)

    const CustomPagination = props => <Pagination rowsPerPageOptions={[5, 10, 25, 50]} {...props} />;

    const ExtraEntryFilter = (props) => (
        <Filter {...props}>
            <TextInput label="Nimi" source="name" autoFocus />
            <TextInput label="Puhelinnumero" source="phoneNumber" autoFocus />
            <SelectInput label="Merkintätyyppi" source="extraEntryType" choices={[]} />
        </Filter>
    );

    return (
        <List title="Lisämerkinnät" pagination={<CustomPagination />} debounce={1000} filters={<ExtraEntryFilter />} bulkActionButtons={false} exporter={false} {...props}>
            <Datagrid>
                <TextField label="Nimi" source="displayName" />
                <TextField source="age" label="Ikä" />
                <TextField label="Puhelinnumero" source="phoneNumber" />
                <TextField label="Lisämerkinnät" source="extraEntries" />
                <CustomEditButton />
            </Datagrid>
        </List>
    )
};

export const ExtraEntryCreate = (props) => {
    const [extraEntryTypeChoices, setExtraEntryTypeChoices] = useState([]);

    useEffect(() => {
        const addExtraEntryTypesToState = async () => {
            const parsedExtraEntryTypes = await getExtraEntryTypes();
            setExtraEntryTypeChoices(parsedExtraEntryTypes);
            console.log('parsedExtraEntryTypes', parsedExtraEntryTypes)
        };
        addExtraEntryTypesToState();
    }, []);

    return (
        <Create title="Luo lisämerkintä" {...props}>
            <SimpleForm variant="standard" margin="normal">
                <TextInput label="Etunimi" source="firstName" validate={required()} />
                <TextInput label="Sukunimi" source="lastName" validate={required()} />
                <TextInput label="Kutsumanimi" source="nickName" validate={required()} />
                <DateInput label="Syntymäaika" source="birthday" validate={[required(), ageValidator]} />
                <TextInput label="Puhelinnumero" source="phoneNumber" validate={required()}/>
                <SelectInput label="Lisämerkinnät" source="extraEntries" choices={extraEntryTypeChoices} validate={required()} />
            </SimpleForm>        
        </Create>
    );
};

