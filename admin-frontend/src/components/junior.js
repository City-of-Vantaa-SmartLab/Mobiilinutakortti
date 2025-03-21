import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useForm } from 'react-final-form';
import Button from '@material-ui/core/Button';
import { QRCodeSVG } from 'qrcode.react'
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
import { getYouthClubOptions, getActiveYouthClubOptions, ageValidator, genderChoices, statusChoices, Status, appUrl } from '../utils';
import { httpClientWithRefresh } from '../httpClients';
import useAdminPermission from '../hooks/useAdminPermission';
import { hiddenFormFields } from '../customizations';
import { ExtraEntryLink } from './styledComponents/extraEntry';
import api from '../api';
import useAutoLogout from '../hooks/useAutoLogout';

const JuniorEditTitle = ({ record }) => (
    <span>{`Muokkaa ${record.firstName} ${record.lastName}`}</span>
);

const SMSwarning = () => (
    <div style={{paddingTop: '1em', color: 'red'}}>Huom! Nuorelle lähetetään kirjautumislinkki tekstiviestitse, kun tallennat tiedot.</div>
);

export const JuniorList = (props) => {
    const CustomPagination = props => <Pagination rowsPerPageOptions={[5, 10, 25, 50]} {...props} />;
    const notify = useNotify();
    const autoFocusSource = useRef(null);
    const [youthClubs, setYouthClubs] = useState([]);

    useAutoLogout();

    useEffect(() => {
        const addYouthClubsToState = async () => {
            const youthClubOptions = await getYouthClubOptions();
            setYouthClubs(youthClubOptions);
        };
        addYouthClubsToState();
    }, []);

    // Since React re-renders after search debounce, the input focus would always be set to the last filter input component with auto focus. Therefore we manually keep track of what was the last input the user typed in to set auto focus correctly. We use useRef and not useState to prevent re-rendering on first keypress.
    const checkAutoFocus = (source) => {
        if (!autoFocusSource.current) return true;
        return autoFocusSource.current === source;
    }

    const setAutoFocus = (source) => {
        autoFocusSource.current = source;
    }

    // The formatter for home youth club prevents unnecessary warnings before data is actually loaded.
    const JuniorFilter = (props) => (
        <Filter {...props}>
            <TextInput label="Nimi" source="name" autoFocus={checkAutoFocus("name")} onInput={() => setAutoFocus("name")} />
            <TextInput label="Nuoren puhelinnumero" source="phoneNumber" autoFocus={checkAutoFocus("phoneNumber")} onInput={() => setAutoFocus("phoneNumber")} />
            <TextInput label="Huoltajan puhelinnumero" source="parentsPhoneNumber" autoFocus={checkAutoFocus("parentsPhoneNumber")} onInput={() => setAutoFocus("parentsPhoneNumber")} />
            <SelectInput label="Kotinuorisotila" source="homeYouthClub" choices={youthClubs} format={v => youthClubs?.find(c => c.id === v)?.id ?? ''} onChange={() => setAutoFocus("none")} />
            <SelectInput label="Tila" source="status" choices={statusChoices} onChange={() => setAutoFocus("none")} />
        </Filter>
    );

    const ResendSMSButton = (data) => (
        (data.record.status === Status.accepted || data.record.status === Status.expired)
            ? <Button size="small" variant="contained" onClick={() => resendSMS(data.record.phoneNumber)} >Lähetä SMS uudestaan</Button>
            : <Button disabled>Kotisoitto tekemättä</Button>
    )

    const QRCodeWithStatusMessage = ({ status, id }) => (
        <div style={status === Status.expired ? expiredQrCodeStyle : validQrCodeStyle}>
            <QRCodeSVG value={id} marginSize={4} size={400} />
            <span style={qrCodeMessageStyle}>
                {status === Status.expired ? 'Edellinen kausi' : 'Kuluva kausi'}
            </span>
        </div>
    );

    const generateQRAndOpen = async (id, status, owner) => {
        try {
            const newWindow = window.open('');
            const container = document.createElement('div');
            // React 17 syntax, ignore deprecation warning until updated to React 18.
            ReactDOM.render(
                <React.StrictMode>
                    <QRCodeWithStatusMessage status={status} id={id} />
                </React.StrictMode>,
                container
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
        const url = api.junior.loginLink;
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
        if (response.message) cb(response.message);
    });
}

const DummyPhoneNumberButton = ({fieldName}) => {
    const form = useForm();
    return (
        <Button  style={{marginBottom: '5px'}} variant="contained" color="primary" size="small" onClick={() => getDummyPhoneNumber(value => form.change(fieldName, value))}>
            Käytä korvikepuhelinnumeroa
        </Button>
    )
}

export const JuniorCreate = (props) => {
    useAutoLogout();
    return (
        <Create title="Rekisteröi nuori" {...props}>
            {JuniorForm('create')}
        </Create>
    );
}

export const JuniorEdit = (props) => {
    useAutoLogout();

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
    const showExtraEntries = process.env.REACT_APP_ENABLE_EXTRA_ENTRIES;
    const [youthClubs, setYouthClubs] = useState([]);
    const { isAdmin } = useAdminPermission();

    useEffect(() => {
        const addYouthClubsToState = async () => {
            const youthClubOptions = await getActiveYouthClubOptions();
            const optionsWithNone = [{id: -1, name: ''}, ...youthClubOptions];
            setYouthClubs(optionsWithNone);
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
            <TextInput label="Puhelinnumero" source="phoneNumber" validate={required()} helperText={false} />
            <FormDataConsumer>
                {() => <DummyPhoneNumberButton fieldName="phoneNumber" />}
            </FormDataConsumer>
            <BooleanInput label="Tekstiviestit sallittu" source="smsPermissionJunior" helperText={false} />
            {valueOrNull('postCode', <TextInput label="Postinumero" source="postCode" validate={required()} />)}
            {valueOrNull('school', <TextInput label="Koulu" source="school" validate={required()} />)}
            {valueOrNull('class', <TextInput label="Luokka" source="class" validate={required()} />)}
            <TextInput label="Huoltajan nimi" source="parentsName" validate={required()} />
            <TextInput label="Huoltajan puhelinnumero" source="parentsPhoneNumber" validate={required()} helperText={false} />
            <FormDataConsumer>
                {() => <DummyPhoneNumberButton fieldName="parentsPhoneNumber" />}
            </FormDataConsumer>
            <BooleanInput label="Tekstiviestit sallittu" source="smsPermissionParent" helperText={false} />
            <TextInput label="Huoltajan sähköpostiosoite" source="parentsEmail" />
            <BooleanInput label="Sähköpostit sallittu" source="emailPermissionParent" />
            {valueOrNull('additionalContactInformation', <TextInput label="Toisen yhteyshenkilön tiedot" source="additionalContactInformation" />)}
            <SelectInput label="Kotinuorisotila" source="homeYouthClub" choices={youthClubs} format={v => youthClubs?.find(c => c.id === v)?.id ?? ''} />
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
            {(formType === 'edit' && showExtraEntries) &&<FormDataConsumer>
                {({ formData }) => {
                    return <ExtraEntryLink href={`${appUrl}#/extraEntry/${formData.id}`}>Muokkaa nuoren lisämerkintöjä</ExtraEntryLink>

                }}
            </FormDataConsumer>}
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
