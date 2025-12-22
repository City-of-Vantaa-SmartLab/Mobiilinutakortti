import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Button } from '@mui/material';
import { useForm } from 'react-final-form';
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
    PaginationActions,
    FormDataConsumer,
    FunctionField
} from 'react-admin';
import { getYouthClubOptions, getActiveYouthClubOptions, ageValidator, genderChoices, statusChoices, Status, hrefFragmentToExtraEntry, getAlertDialogObserver } from '../utils';
import { httpClientWithRefresh } from '../httpClients';
import { hiddenFormFields } from '../customizations';
import { ExtraEntryLink } from './styledComponents/extraEntry';
import { useSmartAutoLogout } from '../hooks/useSmartAutoLogout';
import { PhoneNumberField } from './phoneNumberField';
import useAdminPermission from '../hooks/useAdminPermission';
import api from '../api';

const JuniorEditTitle = ({ record }) => (
    <span>{`Muokkaa ${record.firstName} ${record.lastName}`}</span>
);

const SMSwarning = () => (
    <div style={{paddingTop: '1em', color: 'red'}}>Huom! Nuorelle lähetetään kirjautumislinkki tekstiviestitse, kun tallennat tiedot.</div>
);

export const JuniorList = (props) => {
    const notify = useNotify();
    const autoFocusSource = useRef(null);
    const [youthClubs, setYouthClubs] = useState([]);
    const smartRefresh = useSmartAutoLogout();
    const smartActions = props => <PaginationActions {...props} onPageChange={(e, np) => { smartRefresh(); props.onPageChange(e, np);}} />;
    const CustomPagination = props => <Pagination {...props} ActionsComponent={smartActions} rowsPerPageOptions={[5, 10, 25, 50]} />

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
            <TextInput label="Nimi" source="name" onFocus={smartRefresh} autoFocus={checkAutoFocus("name")} onInput={() => setAutoFocus("name")} />
            <TextInput label="Nuoren puhelinnumero" onFocus={smartRefresh} source="phoneNumber" autoFocus={checkAutoFocus("phoneNumber")} onInput={() => setAutoFocus("phoneNumber")} />
            <TextInput label="Huoltajan puhelinnumero" onFocus={smartRefresh} source="parentsPhoneNumber" autoFocus={checkAutoFocus("parentsPhoneNumber")} onInput={() => setAutoFocus("parentsPhoneNumber")} />
            <SelectInput label="Kotinuorisotila" onFocus={smartRefresh} source="homeYouthClub" choices={youthClubs} format={v => youthClubs?.find(c => c.id === v)?.id ?? ''} onChange={() => setAutoFocus("none")} />
            <SelectInput label="Tila" source="status" onFocus={smartRefresh} choices={statusChoices} onChange={() => setAutoFocus("none")} />
        </Filter>
    );

    const ResendSMSButton = () => (
        <FunctionField
            render={(record) => (
                <span style={{ display: 'inline-flex', width: '100%', justifyContent: 'center' }}>
                    {(record?.status === Status.accepted || record?.status === Status.expired)
                        ? <Button size="small" variant="contained" onClick={() => resendSMS(record.phoneNumber)}>📨&nbsp;SMS</Button>
                        : <Button size="small" disabled style={{ padding: 0 }}>Kotisoitto tekemättä</Button>}
                </span>
            )}
        />
    );

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
      <Button size="small" variant="contained" onClick={() => generateQRAndOpen(data.record.id, data.record.status, `${data.record.firstName} ${data.record.lastName}`)} >🔍&nbsp;QR</Button>
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
        <List title="Nuoret" pagination={<CustomPagination />} debounce={500} filters={<JuniorFilter />} bulkActionButtons={false} exporter={false} {...props}>
            <Datagrid>
                <TextField label="Nimi" source="displayName" />
                <SelectField label="Sukupuoli" source="gender" choices={genderChoices} />
                <DateField label="Syntymäaika" source="birthday" locales={['fi']} />
                <PhoneNumberField label="Puhelinnumero" source="phoneNumber" />
                <TextField label="Postinumero" source="postCode" />
                <SelectField label="Kotinuorisotila" source="homeYouthClub" choices={youthClubs} />
                <TextField label="Huoltajan nimi" source="parentsName" />
                <PhoneNumberField label="Huoltajan puhelinnumero" source="parentsPhoneNumber" />
                <DateField label="Päiväys" source="creationDate" locales={['fi']} />
                <SelectField label="Tila" source="status" choices={statusChoices} />
                <PrintQrCodeButton label="Näytä QR-koodi" />
                <ResendSMSButton label="Lähetä SMS uudelleen" />
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
    return (
        <Create title="Rekisteröi nuori" {...props}>
            {JuniorForm('create')}
        </Create>
    );
}

export const JuniorEdit = (props) => {
    useEffect(() => {
        const observer = getAlertDialogObserver('Poista nuori');
        return () => {
            observer.disconnect();
        }
    }, []);
    return (
        <Edit title={<JuniorEditTitle />} {...props} mutationMode='pessimistic'>
            {JuniorForm('edit')}
        </Edit>
    );
};


export const JuniorForm = (formType) => {
    const showExtraEntries = process.env.VITE_ENABLE_EXTRA_ENTRIES;
    const [youthClubs, setYouthClubs] = useState([]);
    const { isAdmin } = useAdminPermission();
    const smartRefresh = useSmartAutoLogout();

    useEffect(() => {
        const addYouthClubsToState = async () => {
            const youthClubOptions = await getActiveYouthClubOptions();
            const optionsWithNone = [{id: -1, name: ''}, ...youthClubOptions];
            setYouthClubs(optionsWithNone);
        };
        addYouthClubsToState();
    }, []);

    // We use the dummy div field to check whether we still wish to auto logout using the timeouts defined above.
    return (
        <SimpleForm variant="standard" margin="normal">
            <TextInput label="Etunimi" source="firstName" validate={required()} onFocus={smartRefresh} />
            <TextInput label="Sukunimi" source="lastName" validate={required()} onFocus={smartRefresh} />
            {valueOrNull('nickName', <TextInput label="Kutsumanimi" source="nickName" onFocus={smartRefresh} />)}
            <SelectInput label="Sukupuoli" source="gender" choices={genderChoices} validate={required()} onFocus={smartRefresh} />
            <DateInput label="Syntymäaika" source="birthday" validate={[required(), ageValidator]} onFocus={smartRefresh} />
            <TextInput label="Puhelinnumero" source="phoneNumber" validate={required()} helperText={false} onFocus={smartRefresh} />
            <FormDataConsumer>
                {() => <DummyPhoneNumberButton fieldName="phoneNumber" />}
            </FormDataConsumer>
            <BooleanInput label="Tekstiviestit sallittu" source="smsPermissionJunior" helperText={false} onFocus={smartRefresh} />
            {valueOrNull('postCode', <TextInput label="Postinumero" source="postCode" validate={required()} onFocus={smartRefresh} />)}
            {valueOrNull('school', <TextInput label="Koulu" source="school" validate={required()} onFocus={smartRefresh} />)}
            {valueOrNull('class', <TextInput label="Luokka" source="class" validate={required()} onFocus={smartRefresh} />)}
            <TextInput label="Huoltajan nimi" source="parentsName" validate={required()} onFocus={smartRefresh} />
            <TextInput label="Huoltajan puhelinnumero" source="parentsPhoneNumber" validate={required()} helperText={false} onFocus={smartRefresh} />
            <FormDataConsumer>
                {() => <DummyPhoneNumberButton fieldName="parentsPhoneNumber" />}
            </FormDataConsumer>
            <BooleanInput label="Tekstiviestit sallittu" source="smsPermissionParent" helperText={false} onFocus={smartRefresh} />
            <TextInput label="Huoltajan sähköpostiosoite" source="parentsEmail" onFocus={smartRefresh} />
            <BooleanInput label="Sähköpostit sallittu" source="emailPermissionParent" onFocus={smartRefresh} />
            {valueOrNull('additionalContactInformation', <TextInput label="Toisen yhteyshenkilön tiedot" source="additionalContactInformation" onFocus={smartRefresh} />)}
            <SelectInput label="Kotinuorisotila" source="homeYouthClub" choices={youthClubs} format={v => youthClubs?.find(c => c.id === v)?.id ?? ''} onFocus={smartRefresh} />
            {formType === 'create' ?
                <SelectInput label="Kommunikaatiokieli" source="communicationsLanguage" choices={languages} validate={required()}
                    disabled={hiddenFormFields.includes('communicationsLanguage')} defaultValue="fi"
                />
                :
                valueOrNull('communicationsLanguage', <SelectInput label="Kommunikaatiokieli" source="communicationsLanguage" choices={languages} validate={required()} onFocus={smartRefresh} />)
            }
            <BooleanInput label="Kuvauslupa" source="photoPermission" defaultValue={false} onFocus={smartRefresh} />
            <FormDataConsumer>
                {({ record }) => {
                    return <SelectInput disabled={(formType === 'edit' && (record.status === Status.expired || record.status === Status.extraEntriesOnly) && !isAdmin)} label="Tila" source="status" choices={statusChoices} validate={required()} onFocus={smartRefresh} />
                }}
            </FormDataConsumer>
            <FormDataConsumer>
                {({ formData, record }) => {
                    return formData.status === Status.accepted && (formType === 'create' || record.status !== Status.accepted) && <SMSwarning/>
                }}
            </FormDataConsumer>
            {(formType === 'edit' && showExtraEntries) &&<FormDataConsumer>
                {({ formData }) => {
                    return <ExtraEntryLink href={hrefFragmentToExtraEntry(formData.id)}>Muokkaa nuoren lisämerkintöjä</ExtraEntryLink>

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
