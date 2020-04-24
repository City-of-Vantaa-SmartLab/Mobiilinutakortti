import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
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
    BooleanInput,
    required,
    choices,
    EditButton,
    Edit,
    Filter,
    showNotification,
    Pagination
} from 'react-admin';
import { getYouthClubs, ageValidator, genderChoices, statusChoices } from '../utils'
import Button from '@material-ui/core/Button';
import { httpClientWithResponse } from '../httpClients';
import api from '../api';

const JuniorEditTitle = ({ record }) => (
    <span>{`Muokkaa ${record.firstName} ${record.lastName}`}</span>
);

export const JuniorList = connect(null, { showNotification })(props => {

    const CustomPagination = props => <Pagination rowsPerPageOptions={[5, 10, 25, 50]} {...props} />;

    const { showNotification } = props;

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

    const ResendSMSButton = (data) => (
        data.record.status === "accepted"
            ? <Button size="small" variant="contained" onClick={() => resendSMS(data.record.phoneNumber)} >Lähetä tekstiviesti uudestaan</Button>
            : <Button disabled>Lähetä tekstiviesti uudestaan</Button>
    )

    const resendSMS = async (phoneNumber) => {
        const url = api.junior.reset;
        const body = JSON.stringify({
            phoneNumber
        });
        const options = {
            method: 'POST',
            body
        };
        await httpClientWithResponse(url, options)
            .then(response => {
                if (response.statusCode < 200 || response.statusCode >= 300) {
                    showNotification(response.message, "warning");
                } else {
                    showNotification(response.message);
                }
            });
    }

    return (
        <List title="Nuoret" pagination={<CustomPagination />} filters={<JuniorFilter />} bulkActionButtons={false} exporter={false} {...props}>
            <Datagrid>
                <TextField label="Nimi" source="displayName" />
                <SelectField label="Sukupuoli" source="gender" choices={genderChoices} />
                <DateField label="Syntymäaika" source="birthday" />
                <TextField label="Puhelinnumero" source="phoneNumber" />
                <TextField label="Postinumero" source="postCode" />
                <TextField label="Kotinuorisotalo" source="homeYouthClub" />
                <TextField label="Huoltajan nimi" source="parentsName" />
                <TextField label="Huoltajan puhelinnumero" source="parentsPhoneNumber" />
                <SelectField label="Status" source="status" choices={statusChoices} />
                <ResendSMSButton />
                <EditButton />
            </Datagrid>
        </List>
    )
});

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
                <TextInput label="Kutsumanimi" source="nickName" />
                <SelectInput label="Sukupuoli" source="gender" choices={genderChoices} validate={[required(), choices(['m', 'f', 'o'])]} />
                <DateInput label="Syntymäaika" source="birthday" validate={[required(), ageValidator]} />
                <TextInput label="Puhelinnumero" source="phoneNumber" validate={required()} />
                <TextInput label="Postinumero" source="postCode" validate={required()} />
                <TextInput label="Koulu" source="school" validate={required()} />
                <TextInput label="Luokka" source="class" validate={required()} />
                <TextInput label="Huoltajan nimi" source="parentsName" validate={required()} />
                <TextInput label="Huoltajan puhelinnumero" source="parentsPhoneNumber" validate={required()} />
                <SelectInput label="Kotinuorisotalo" source="homeYouthClub" choices={youthClubs} validate={required()} />
                <BooleanInput label="Kuvauslupa" source="photoPermission" />
                <SelectInput label="Status" source="status" choices={statusChoices} validate={[required(), choices(['accepted', 'pending'])]} />
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

        const targetNode = document;
        const config = { attributes: true, childList: false, subtree: true };

        const checkTitles = () => {
            const title = document.getElementById('alert-dialog-title');
            if (title) {
                title.getElementsByTagName("h2")[0].innerHTML = 'Poista Junior';
            }
        };
        const observer = new MutationObserver(checkTitles);
        observer.observe(targetNode, config);

        return () => {
            observer.disconnect();
        }
    }, []);

    return (
        <Edit title={<JuniorEditTitle />} {...props} undoable={false}>
            <SimpleForm>
                <TextInput label="Etunimi" source="firstName" />
                <TextInput label="Sukunimi" source="lastName" />
                <TextInput label="Kutsumanimi" source="nickName" />
                <SelectInput label="Sukupuoli" source="gender" choices={genderChoices} />
                <DateInput label="Syntymäaika" source="birthday" validate={ageValidator} />
                <TextInput label="Puhelinnumero" source="phoneNumber" />
                <TextInput label="Postinumero" source="postCode" />
                <TextInput label="Koulu" source="school" />
                <TextInput label="Luokka" source="class" />
                <TextInput label="Huoltajan nimi" source="parentsName" />
                <TextInput label="Huoltajan puhelinnumero" source="parentsPhoneNumber" />
                <SelectInput label="Kotinuorisotalo" source="homeYouthClub" choices={youthClubs} />
                <BooleanInput label="Kuvauslupa" source="photoPermission"/>
                <SelectInput label="Status" source="status" choices={statusChoices} />
            </SimpleForm>
        </Edit>
    );
};
