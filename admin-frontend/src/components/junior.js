import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useForm } from 'react-final-form';
import QRCode from 'qrcode.react'
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
    useNotify,
    Pagination,
    FormDataConsumer
} from 'react-admin';
import { getYouthClubs, getActiveYouthClubs, ageValidator, genderChoices, statusChoices, Status } from '../utils';
import Button from '@material-ui/core/Button';
import { httpClientWithRefresh } from '../httpClients';
import api from '../api';
import useAdminPermission from '../hooks/useAdminPermission';
import { hiddenFormFields } from '../customizations';


const JuniorEditTitle = ({ record }) => (
    <span>{`Muokkaa ${record.firstName} ${record.lastName}`}</span>
);


const SMSwarning = () => (
    <div style={{paddingTop: '1em', color: 'red'}}>Huom! Nuorelle lähetetään kirjautumislinkki tekstiviestitse, kun tallennat tiedot.</div>
);


export const JuniorList = (props) => {
    const CustomPagination = props => <Pagination rowsPerPageOptions={[5, 10, 25, 50]} {...props} />;
    const notify = useNotify();

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
            <TextInput label="Nimi" source="name" autoFocus />
            <TextInput label="Nuoren puhelinnumero" source="phoneNumber" autoFocus />
            <TextInput label="Huoltajan puhelinnumero" source="parentsPhoneNumber" autoFocus />
            <SelectInput label="Kotinuorisotila" source="homeYouthClub" choices={youthClubs} />
            <SelectInput label="Tila" source="status" choices={statusChoices} />
        </Filter>
    );

    const ResendSMSButton = (data) => (
        (data.record.status === Status.accepted || data.record.status === Status.expired)
            ? <Button size="small" variant="contained" onClick={() => resendSMS(data.record.phoneNumber)} >Lähetä SMS uudestaan</Button>
            : <Button disabled>Kotisoitto tekemättä</Button>
    )

    const QRCodeWithStatusMessage = ({ status, id }) => (
        <div style={status === Status.expired ? expiredQrCodeStyle : validQrCodeStyle}>
            <QRCode value={id} includeMargin={true} size={400} />
            <span style={qrCodeMessageStyle}>
                {status === Status.expired ? 'Edellinen kausi' : 'Kuluva kausi'}
            </span>
        </div>
    );

    const generateQRAndOpen = async (id, status, owner) => {
        try {
            const newWindow = window.open('');
            const container = document.createElement('div');
            ReactDOM.render(
                <QRCodeWithStatusMessage status={status} id={id} />,
                container,
            );
            setTimeout(() => (newWindow.document.title = `QR-koodi ${owner}`), 0);
            newWindow.document.body.appendChild(container);
        } catch (err) {
            alert("Virhe QR-koodin luonnissa")
        }
    }


    const PrintQrCodeButton = (data) => (
      <Button size="small" variant="contained" onClick={() => generateQRAndOpen(data.record.id, data.record.status, `${data.record.firstName} ${data.record.lastName}`)} >🔍QR</Button>
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
        await httpClientWithRefresh(url, options)
            .then(response => {
                if (response.statusCode < 200 || response.statusCode >= 300) {
                    notify(response.message, "warning");
                } else {
                    notify(response.message);
                }
            });
    }

    return (
        <List title="Nuoret" pagination={<CustomPagination />} debounce={1000} filters={<JuniorFilter />} bulkActionButtons={false} exporter={false} {...props}>
            <Datagrid>
                <TextField label="Nimi" source="displayName" />
                <SelectField label="Sukupuoli" source="gender" choices={genderChoices} />
                <DateField label="Syntymäaika" source="birthday" locales={['fi']} />
                <TextField label="Puhelinnumero" source="phoneNumber" />
                <TextField label="Postinumero" source="postCode" />
                <SelectField label="Kotinuorisotila" source="homeYouthClub" choices={youthClubs} />
                <TextField label="Huoltajan nimi" source="parentsName" />
                <TextField label="Huoltajan puhelinnumero" source="parentsPhoneNumber" />
                <DateField label="Päiväys" source="creationDate" locales={['fi']} />
                <SelectField label="Tila" source="status" choices={statusChoices} />
                <PrintQrCodeButton></PrintQrCodeButton>
                <ResendSMSButton />
                <EditButton />
            </Datagrid>
        </List>
    )
};

const getDummyPhoneNumber = async (cb) => {
    const url = api.junior.dummynumber;
    await httpClientWithRefresh(url)
      .then(response => {
          if (response.message) {
              cb("phoneNumber", response.message)
          }
      });
}

const DummyPhoneNumberButton = () => {
    const form = useForm();
    return (
        <Button variant="contained" color="primary" size="small" onClick={() => getDummyPhoneNumber((field, value) => form.change(field, value))}>
            Käytä korvikepuhelinnumeroa
        </Button>
    )
}

export const JuniorCreate = (props) => {
    return (
        <Create title="Rekisteröi nuori" {...props}>
            {JuniorForm('create')}
        </Create>
    );
}

export const JuniorEdit = (props) => {

    useEffect(() => {
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
            {JuniorForm('edit')}
        </Edit>
    );
};


export const JuniorForm = (formType) => {
    const [youthClubChoices, setYouthClubChoices] = useState([]);
    const { isAdmin } = useAdminPermission();

    useEffect(() => {
        const addYouthClubsToState = async () => {
            const parsedYouthClubs = await getActiveYouthClubs();
            setYouthClubChoices(parsedYouthClubs);
        };
        addYouthClubsToState();
    }, []);

    return (
        <SimpleForm variant="standard" margin="normal">
            <TextInput label="Etunimi" source="firstName" validate={required()} />
            <TextInput label="Sukunimi" source="lastName" validate={required()} />
            {valueOrNull('nickName', <TextInput label="Kutsumanimi" source="nickName" />)}
            <SelectInput label="Sukupuoli" source="gender" choices={genderChoices} validate={required()} />
            <DateInput label="Syntymäaika" source="birthday" validate={[required(), ageValidator]} />
            <TextInput label="Puhelinnumero" source="phoneNumber" validate={required()}/>
            <BooleanInput label="Infoviestit sallittu" source="smsPermissionJunior" />
            <FormDataConsumer>
                {() => <DummyPhoneNumberButton />}
            </FormDataConsumer>
            {valueOrNull('postCode', <TextInput label="Postinumero" source="postCode" validate={required()} />)}
            {valueOrNull('school', <TextInput label="Koulu" source="school" validate={required()} />)}
            {valueOrNull('class', <TextInput label="Luokka" source="class" validate={required()} />)}
            <TextInput label="Huoltajan nimi" source="parentsName" validate={required()} />
            <TextInput label="Huoltajan puhelinnumero" source="parentsPhoneNumber" validate={required()} />
            <BooleanInput label="Tekstiviestit sallittu" source="smsPermissionParent" />
            <TextInput label="Huoltajan sähköpostiosoite" source="parentsEmail" />
            <BooleanInput label="Sähköpostit sallittu" source="emailPermissionParent" />
            {valueOrNull('additionalContactInformation', <TextInput label="Toisen yhteyshenkilön tiedot" source="additionalContactInformation" />)}
            <SelectInput label="Kotinuorisotila" source="homeYouthClub" choices={youthClubChoices} validate={required()} />
            {formType === 'create' ?
                <SelectInput label="Kommunikaatiokieli" source="communicationsLanguage" choices={languages} validate={required()}
                    disabled={hiddenFormFields.includes('communicationsLanguage')} defaultValue="fi"
                />
                :
                valueOrNull('communicationsLanguage', <SelectInput label="Kommunikaatiokieli" source="communicationsLanguage" choices={languages} validate={required()}/>)
            }
            <BooleanInput label="Kuvauslupa" source="photoPermission" defaultValue={false}/>
            <FormDataConsumer>
                {({ record }) => {
                    return <SelectInput disabled={(formType === 'edit' && record.status === Status.expired && !isAdmin)} label="Tila" source="status" choices={statusChoices} validate={required()} />
                }}
            </FormDataConsumer>
            <FormDataConsumer>
                {({ formData, record }) => {
                    return formData.status === Status.accepted && (formType === 'create' || record.status !== Status.accepted) && <SMSwarning/>
                }}
            </FormDataConsumer>
        </SimpleForm>
    );
}

const qrCodeMessageStyle = {
    color: '#000000',
    fontSize: '2em',
    fontFamily: 'sans-serif',
    textTransform: 'uppercase',
    margin: '5px'
};

const qrCodeContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    width: '400px',
};

const validQrCodeStyle = {
    ...qrCodeContainerStyle,
    backgroundColor: '#6bc24a'
};

const expiredQrCodeStyle = {
    ...qrCodeContainerStyle,
    backgroundColor: '#f7423a'
};

const languages = [
  { id: 'fi', name: 'suomi' },
  { id: 'sv', name: 'ruotsi' },
  { id: 'en', name: 'englanti' },
]

function valueOrNull(name, visibleValue) {
  return hiddenFormFields.includes(name) ? null : visibleValue;
}
