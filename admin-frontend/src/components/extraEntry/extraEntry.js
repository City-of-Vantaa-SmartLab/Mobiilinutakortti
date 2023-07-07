import React, { useEffect, useState } from 'react';
import {
    List,
    Datagrid,
    EditButton,
    TextField,
    SimpleForm,
    TextInput,
    SelectInput,
    required,
    Filter,
    Pagination,
    DateInput,
    SelectArrayInput,
    ArrayField,
    SingleFieldList,
    ChipField,
    Edit
} from 'react-admin';
import { ageValidator, getExtraEntryTypes } from '../../utils';

export const ExtraEntryList = (props) => {
    const [extraEntryTypeChoices, setExtraEntryTypeChoices] = useState([]);

    useEffect(() => {
        const addExtraEntryTypesToState = async () => {
            const extraEntryTypes = await getExtraEntryTypes();
            const typesWithCustomOptions = [...extraEntryTypes, {id: -1, name: "Ei lisämerkintöjä"}, {id: -2, name: "Mikä tahansa lisämerkintä"}]
            setExtraEntryTypeChoices(typesWithCustomOptions);
        };
        addExtraEntryTypesToState();
    }, []);

    const CustomPagination = props => <Pagination rowsPerPageOptions={[5, 10, 25, 50]} {...props} />;

    const ExtraEntryFilter = (props) => (
        <Filter {...props}>
            <TextInput label="Nimi" source="name" autoFocus />
            <TextInput label="Puhelinnumero" source="phoneNumber" autoFocus />
            <SelectInput label="Merkintätyyppi" source="extraEntryType" choices={extraEntryTypeChoices} />
        </Filter>
    );

    return (
        <List title="Lisämerkinnät" pagination={<CustomPagination />} debounce={1000} filters={<ExtraEntryFilter />} bulkActionButtons={false} exporter={false} {...props}>
            <Datagrid>
                <TextField label="Nimi" source="displayName" />
                <TextField source="age" label="Ikä" />
                <TextField label="Puhelinnumero" source="phoneNumber" />
                <ArrayField label="Lisämerkinnät" source="extraEntries">
                    <SingleFieldList linkType={false} >
                        <ChipField source="extraEntryType.name" size="small" />
                    </SingleFieldList>
                </ArrayField>
                <EditButton />
            </Datagrid>
        </List>
    )
};

export const ExtraEntryEdit = (props) => {
    const [extraEntryTypeChoices, setExtraEntryTypeChoices] = useState([]);

    useEffect(() => {
        const addExtraEntryTypesToState = async () => {
            const extraEntryTypes = await getExtraEntryTypes();
            setExtraEntryTypeChoices(extraEntryTypes);
        };
        addExtraEntryTypesToState();
    }, []);

    return (
        <Edit title="Moukkaa lisämerkintöjä" {...props}>
            <SimpleForm variant="standard" margin="normal">
                <TextInput label="Etunimi" source="firstName" validate={required()} />
                <TextInput label="Sukunimi" source="lastName" validate={required()} />
                <TextInput label="Kutsumanimi" source="nickName" validate={required()} />
                <DateInput label="Syntymäaika" source="birthday" validate={[required(), ageValidator]} />
                <TextInput label="Puhelinnumero" source="phoneNumber" validate={required()}/>
                <SelectArrayInput label="Lisämerkinnät" source="extraEntries" choices={extraEntryTypeChoices} validate={required()} />
            </SimpleForm>
        </Edit>
    );
};

