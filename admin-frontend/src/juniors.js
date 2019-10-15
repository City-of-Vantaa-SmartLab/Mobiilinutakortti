import React from 'react';
import { List, Datagrid, TextField, SelectField, NumberField, EditButton, Create, SimpleForm, TextInput, SelectInput, NumberInput, Edit, DisabledInput } from 'react-admin';

const choices = [
    { id: 'm', name: 'Uros' },
    { id: 'f', name: 'Nainen' },
    { id: 'o', name: 'Muut' }
];

export const JuniorList = (props) => (
    <List {...props} >
        <Datagrid>
            <TextField source="phoneNumber" />
            <TextField source="lastName" />
            <TextField source="firstName" />
            <SelectField source="gender" choices={choices} />
            <NumberField source="age" />
            <TextField source="homeYouthClub" />
            <TextField source="postCode" />
            <TextField source="parentsName" />
            <TextField source="parentsPhoneNumber" />
            <EditButton />
        </Datagrid>
    </List>
);

export const JuniorCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <TextInput source="phoneNumber" />
            <TextInput source="lastName" />
            <TextInput source="firstName" />
            <SelectInput source="gender" choices={choices} />
            <NumberInput source="age" />
            <TextInput source="homeYouthClub" />
            <TextInput source="postCode" />
            <TextInput source="parentsName" />
            <TextInput source="parentsPhoneNumber" />
        </SimpleForm>
    </Create>
);

export const JuniorEdit = (props) => (
    <Edit {...props}>
        <SimpleForm>
            <DisabledInput label="Id" source="id" />
            <TextInput source="phoneNumber" />
            <TextInput source="lastName" />
            <TextInput source="firstName" />
            <SelectInput source="gender" choices={choices} />
            <NumberInput source="age" />
            <TextInput source="homeYouthClub" />
            <TextInput source="postCode" />
            <TextInput source="parentsName" />
            <TextInput source="parentsPhoneNumber" />
            {/* <TextInput source="title" validate={required()} />
            <LongTextInput source="teaser" validate={required()} />
            <RichTextInput source="body" validate={required()} />
            <DateInput label="Publication date" source="published_at" />
            <ReferenceManyField label="Comments" reference="comments" target="post_id">
                <Datagrid>
                    <TextField source="body" />
                    <DateField source="created_at" />
                    <EditButton />
                </Datagrid>
            </ReferenceManyField> */}
        </SimpleForm>
    </Edit>
);