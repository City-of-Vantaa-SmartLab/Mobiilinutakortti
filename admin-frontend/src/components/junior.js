import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import QRCode from 'qrcode'
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
    EditButton,
    Edit,
    Filter,
    showNotification,
    Pagination,
    FormDataConsumer
} from 'react-admin';
import { getYouthClubs, ageValidator, genderChoices, statusChoices } from '../utils'
import Button from '@material-ui/core/Button';
import { httpClientWithResponse } from '../httpClients';
import api from '../api';

const JuniorEditTitle = ({ record }) => (
    <span>{`Muokkaa ${record.firstName} ${record.lastName}`}</span>
);

const juniorPhoneNumberInput = "juniorPhoneNumberInput";

const SMSwarning = () => (
    <div style={{paddingTop: '1em', color: 'red'}}>Huom! Nuorelle lähetetään kirjautumislinkki tekstiviestitse, kun tallennat tiedot.</div>
);

const getDummyPhoneNumber = async (record) => {
    const url = api.junior.dummynumber;
    await httpClientWithResponse(url)
        .then(response => {
            if (response.message) {
                // TODO: remove the id and getelementbyid and replace by setting react model state
                const field = document.getElementById(juniorPhoneNumberInput);
                field.value = response.message;
                record.phoneNumber = response.message; // TODO so here something; also crashes on new since record is empty
            }
        });
}

const DummyPhoneNumberButton = (data) => (
    <Button variant="contained" color="primary" size="small" onClick={() => getDummyPhoneNumber(data.record)}>
        Käytä korvikepuhelinnumeroa
    </Button>
)

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
            <SelectInput label="Kotinuorisotila" source="homeYouthClub" choices={youthClubs} />
            <SelectInput label="Kotisoitto" source="status" choices={statusChoices} />
        </Filter>
    );

    const ResendSMSButton = (data) => (
        data.record.status === "accepted"
            ? <Button size="small" variant="contained" onClick={() => resendSMS(data.record.phoneNumber)} >Lähetä SMS uudestaan</Button>
            : <Button disabled>Kotisoitto tekemättä</Button>
    )


    const generateQRAndOpen = async (id, owner) => {
        try {
            const data = await QRCode.toDataURL(id);
            const image = new Image();
            image.src = data;
            image.width = 400;

            const w = window.open("");
            setTimeout(() => w.document.title = `QR-koodi ${owner}`, 0);
            w.document.write(image.outerHTML);
        } catch (err) {
            alert("Virhe QR-koodin luonnissa")
        }
    }


    const PrintQrCodeButton = (data) => (
      <Button size="small" variant="contained" onClick={() => generateQRAndOpen(data.record.id, `${data.record.firstName} ${data.record.lastName}`)} >🔍QR</Button>
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
                <DateField label="Syntymäaika" source="birthday" locales={['fi']} />
                <TextField label="Puhelinnumero" source="phoneNumber" />
                <TextField label="Postinumero" source="postCode" />
                <SelectField label="Kotinuorisotila" source="homeYouthClub" choices={youthClubs} />
                <TextField label="Huoltajan nimi" source="parentsName" />
                <TextField label="Huoltajan puhelinnumero" source="parentsPhoneNumber" />
                <SelectField label="Kotisoitto" source="status" choices={statusChoices} />
                <PrintQrCodeButton></PrintQrCodeButton>
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
                <SelectInput label="Sukupuoli" source="gender" choices={genderChoices} validate={required()} />
                <DateInput label="Syntymäaika" source="birthday" validate={[required(), ageValidator]} />
                <TextInput label="Puhelinnumero" source="phoneNumber" validate={required()} />
                <DummyPhoneNumberButton />
                <TextInput label="Postinumero" source="postCode" validate={required()} />
                <TextInput label="Koulu" source="school" validate={required()} />
                <TextInput label="Luokka" source="class" validate={required()} />
                <TextInput label="Huoltajan nimi" source="parentsName" validate={required()} />
                <TextInput label="Huoltajan puhelinnumero" source="parentsPhoneNumber" validate={required()} />
                <SelectInput label="Kotinuorisotila" source="homeYouthClub" choices={youthClubs} validate={required()} />
                <BooleanInput label="Kuvauslupa" source="photoPermission" defaultValue={false}/>
                <SelectInput label="Kotisoitto" source="status" choices={statusChoices} validate={required()} />
                <FormDataConsumer>
                 {({ formData }) => formData.status === 'accepted' &&
                    <SMSwarning/>
                 }
             </FormDataConsumer>
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
                <TextInput label="Etunimi" source="firstName" validate={required()}/>
                <TextInput label="Sukunimi" source="lastName" validate={required()}/>
                <TextInput label="Kutsumanimi" source="nickName" />
                <SelectInput label="Sukupuoli" source="gender" choices={genderChoices} validate={required()}/>
                <DateInput label="Syntymäaika" source="birthday" validate={[required(), ageValidator]}/>
                <TextInput id={juniorPhoneNumberInput} label="Puhelinnumero" source="phoneNumber" validate={required()}/>
                <DummyPhoneNumberButton />
                <TextInput label="Postinumero" source="postCode" validate={required()}/>
                <TextInput label="Koulu" source="school" validate={required()}/>
                <TextInput label="Luokka" source="class" validate={required()}/>
                <TextInput label="Huoltajan nimi" source="parentsName" validate={required()}/>
                <TextInput label="Huoltajan puhelinnumero" source="parentsPhoneNumber" validate={required()}/>
                <SelectInput label="Kotinuorisotila" source="homeYouthClub" choices={youthClubs} validate={required()}/>
                <BooleanInput label="Kuvauslupa" source="photoPermission" />
                <SelectInput label="Kotisoitto" source="status" choices={statusChoices} validate={required()}/>
                <FormDataConsumer>
                 {({ formData, record }) => (formData.status === 'accepted' && record.status==='pending') &&
                    <SMSwarning/>
                 }
             </FormDataConsumer>
            </SimpleForm>
        </Edit>
    );
};
