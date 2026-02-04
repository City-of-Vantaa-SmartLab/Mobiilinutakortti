import React, { useState, useEffect, useRef, CSSProperties, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@mui/material';
import { useFormContext } from 'react-hook-form';
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
    FunctionField,
    ListProps,
    CreateProps,
    EditProps,
    useRecordContext
} from 'react-admin';
import { getYouthClubOptions, getActiveYouthClubOptions, ageValidator, genderChoices, statusChoices, Status, getAlertDialogObserver } from '../utils';
import { httpClientWithRefresh } from '../httpClients';
import { hiddenFormFields } from '../customizations';
import { useSmartAutoLogout } from '../hooks/useSmartAutoLogout';
import { PhoneNumberField } from './phoneNumberField';
import useAdminPermission from '../hooks/useAdminPermission';
import api from '../api';
import { CalendarHelper } from './calendarHelper';
import { CustomBasicToolbar, LoadingMessage } from './styledComponents';

const ExtraEntryLinkComponent = lazy(() => import('./extraEntry/extraEntryLinkWrapper'));

interface JuniorRecord {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phoneNumber: string;
  status: string;
}

// Custom button components in Datagrid need to accept label prop for column headers.
interface ButtonProps {
  label?: string;
}

const JuniorEditTitle = () => {
    const record = useRecordContext<JuniorRecord>();
    if (!record) return null;
    return <span>{`Muokkaa nuoren tietoja: ${record.firstName} ${record.lastName}`}</span>;
};

const SMSwarning = () => (
    <div style={{paddingTop: '1em', color: 'red'}}>Huom! Nuorelle lähetetään kirjautumislinkki tekstiviestitse, kun tallennat tiedot.</div>
);

export const JuniorList = (props: ListProps) => {
    const notify = useNotify();
    const autoFocusSource = useRef(null);
    const [youthClubs, setYouthClubs] = useState([]);
    const smartRefresh = useSmartAutoLogout();
    const smartActions = (props: any) => <PaginationActions {...props} onPageChange={(e, np) => { smartRefresh(); props.onPageChange(e, np);}} />;
    const CustomPagination = (props: any) => <Pagination {...props} ActionsComponent={smartActions} rowsPerPageOptions={[5, 10, 25, 50]} />

    useEffect(() => {
        const addYouthClubsToState = async () => {
            const youthClubOptions = await getYouthClubOptions();
            setYouthClubs(youthClubOptions);
        };
        addYouthClubsToState();
    }, []);

    // Since React re-renders after search debounce, the input focus would always be set to the last filter input component with auto focus. Therefore we manually keep track of what was the last input the user typed in to set auto focus correctly. We use useRef and not useState to prevent re-rendering on first keypress.
    const checkAutoFocus = (source: string) => {
        if (!autoFocusSource.current) return true;
        return autoFocusSource.current === source;
    }

    const setAutoFocus = (source: string) => {
        autoFocusSource.current = source;
    }

    // The formatter for home youth club prevents unnecessary warnings before data is actually loaded.
    const JuniorFilter = (props: any) => (
        <Filter {...props}>
            <TextInput label="Nimi" source="name" onFocus={smartRefresh} autoFocus={checkAutoFocus("name")} onInput={() => setAutoFocus("name")} />
            <TextInput label="Nuoren puhelinnumero" onFocus={smartRefresh} source="phoneNumber" autoFocus={checkAutoFocus("phoneNumber")} onInput={() => setAutoFocus("phoneNumber")} />
            <TextInput label="Huoltajan puhelinnumero" onFocus={smartRefresh} source="parentsPhoneNumber" autoFocus={checkAutoFocus("parentsPhoneNumber")} onInput={() => setAutoFocus("parentsPhoneNumber")} />
            <SelectInput label="Kotinuorisotila" onFocus={smartRefresh} source="homeYouthClub" choices={youthClubs} format={v => youthClubs?.find(c => c.id === v)?.id ?? ''} onChange={() => setAutoFocus("none")} />
            <SelectInput label="Tila" source="status" onFocus={smartRefresh} choices={statusChoices} onChange={() => setAutoFocus("none")} />
        </Filter>
    );

    const ResendSMSButton = (_props: ButtonProps) => (
        <FunctionField
            render={(record: JuniorRecord) => (
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

    const showQR = async (id: string, status: string, owner: string) => {
        try {
            const newWindow = window.open('');
            if (!newWindow) {
                alert("Virhe: ponnahdusikkuna estettiin");
                return;
            }
            const container = document.createElement('div');
            newWindow.document.body.appendChild(container);
            const root = createRoot(container);
            root.render(
                <React.StrictMode>
                    <QRCodeWithStatusMessage status={status} id={id} />
                </React.StrictMode>
            );
            setTimeout(() => (newWindow.document.title = `QR-koodi ${owner}`), 0);
        } catch (err) {
            console.error(err);
            alert("Virhe QR-koodin luonnissa");
        }
    }

    const PrintQrCodeButton = (_props: ButtonProps) => {
      const record = useRecordContext<JuniorRecord>();
      if (!record) return null;
      return (
        <Button size="small" variant="contained" onClick={() => showQR(record.id, record.status, `${record.firstName} ${record.lastName}`)}>🔍&nbsp;QR</Button>
      );
    }

    const resendSMS = async (phoneNumber: string) => {
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
                    notify(response.message, { type: 'warning' });
                } else {
                    notify(response.message);
                }
            });
    }

    return (
        <List title="Nuoret" pagination={<CustomPagination />} debounce={500} filters={<JuniorFilter />} exporter={false} {...props}>
            <Datagrid bulkActionButtons={false} rowClick={false}>
                <TextField label="Nimi" source="displayName" />
                <SelectField label="Sukupuoli" source="gender" choices={genderChoices} />
                <DateField label="Syntymäaika" source="birthday" locales={['fi']} />
                <PhoneNumberField label="Puhelinnumero" source="phoneNumber" />
                <TextField label="Postinumero" source="postCode" />
                <SelectField label="Kotinuorisotila" source="homeYouthClub" choices={youthClubs} />
                <TextField label="Huoltajan nimi" source="parentsName" />
                <PhoneNumberField label="Huoltajan puhelinnumero" source="parentsPhoneNumber" />
                <DateField label="Luontipäivä" source="creationDate" locales={['fi']} />
                <SelectField label="Tila" source="status" choices={statusChoices} />
                <PrintQrCodeButton label="Näytä QR-koodi" />
                <ResendSMSButton label="Lähetä SMS uudelleen" />
                <EditButton />
            </Datagrid>
        </List>
    )
};

const getDummyPhoneNumber = async (cb: (value: string) => void) => {
    const url = api.junior.dummynumber;
    await httpClientWithRefresh(url)
    .then(response => {
        if (response.message) cb(response.message);
    });
}

const DummyPhoneNumberButton = ({fieldName}: {fieldName: string}) => {
    const { setValue } = useFormContext();
    return (
        <Button style={{ marginTop: '5px' }} variant="contained" color="primary" size="small" onClick={() => getDummyPhoneNumber((value: string) => setValue(fieldName, value, { shouldDirty: true }))}>
            Käytä korvikepuhelinnumeroa
        </Button>
    )
}

export const JuniorCreate = (props: CreateProps) => {
    return (
        <Create title="Rekisteröi nuori" {...props}>
            <JuniorForm formType="create" />
        </Create>
    );
}

export const JuniorEdit = (props: EditProps) => {
    useEffect(() => {
        const observer = getAlertDialogObserver('Poista nuori');
        return () => {
            observer.disconnect();
        }
    }, []);

    return (
        <Edit title={<JuniorEditTitle />} {...props} mutationMode='pessimistic'>
            <JuniorForm formType="edit" />
        </Edit>
    );
};


export const JuniorForm = ({ formType }: { formType: string }) => {
    const showExtraEntries = import.meta.env.VITE_ENABLE_EXTRA_ENTRIES;
    const [youthClubs, setYouthClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAdminPermission();
    const smartRefresh = useSmartAutoLogout();

    useEffect(() => {
        const addYouthClubsToState = async () => {
            const youthClubOptions = await getActiveYouthClubOptions();
            const optionsWithNone = [{id: -1, name: ''}, ...youthClubOptions];
            setYouthClubs(optionsWithNone);
            setLoading(false);
        };
        addYouthClubsToState();
    }, []);

    return (
        <SimpleForm toolbar={<CustomBasicToolbar listPath="/junior" showDelete={formType === 'edit'} />}>
            {loading ? null : (<>
            <div style={{ display: 'none' }}></div>
            <TextInput label="Etunimi" source="firstName" validate={required()} onFocus={smartRefresh} sx={{ width: 400 }} />
            <TextInput label="Sukunimi" source="lastName" validate={required()} onFocus={smartRefresh} sx={{ width: 400 }} />
            {valueOrNull('nickName', <TextInput label="Kutsumanimi" source="nickName" onFocus={smartRefresh} sx={{ width: 400 }} />)}
            <SelectInput label="Sukupuoli" source="gender" choices={genderChoices} validate={required()} onFocus={smartRefresh} sx={{ width: 400 }} />
            <DateInput
                label="Syntymäaika"
                source="birthday"
                validate={[required(), ageValidator]}
                onFocus={smartRefresh}
                helperText={<CalendarHelper />}
                sx={{ mb: 4, width: 400 }}
            />
            <TextInput label="Puhelinnumero" source="phoneNumber" validate={required()} helperText={false} onFocus={smartRefresh} sx={{ width: 400 }} />
            <FormDataConsumer>
                {() => <DummyPhoneNumberButton fieldName="phoneNumber" />}
            </FormDataConsumer>
            <BooleanInput label="Tekstiviestit sallittu" source="smsPermissionJunior" helperText={false} onFocus={smartRefresh} sx={{ mb: 4 }} />
            {valueOrNull('postCode', <TextInput label="Postinumero" source="postCode" validate={required()} onFocus={smartRefresh} sx={{ width: 400 }} />)}
            {valueOrNull('school', <TextInput label="Koulu" source="school" validate={required()} onFocus={smartRefresh} sx={{ width: 400 }} />)}
            {valueOrNull('class', <TextInput label="Luokka" source="class" validate={required()} onFocus={smartRefresh} sx={{ width: 400 }} />)}
                <TextInput label="Huoltajan nimi" source="parentsName" validate={required()} onFocus={smartRefresh} sx={{ mt: 2, width: 400 }} />
            <TextInput label="Huoltajan puhelinnumero" source="parentsPhoneNumber" validate={required()} helperText={false} onFocus={smartRefresh} sx={{ width: 400 }} />
            <FormDataConsumer>
                {() => <DummyPhoneNumberButton fieldName="parentsPhoneNumber" />}
            </FormDataConsumer>
            <BooleanInput label="Tekstiviestit sallittu" source="smsPermissionParent" helperText={false} onFocus={smartRefresh} sx={{ mb: 4 }} />
            <TextInput label="Huoltajan sähköpostiosoite" source="parentsEmail" onFocus={smartRefresh} helperText={false} sx={{ width: 400 }} />
            <BooleanInput label="Sähköpostit sallittu" source="emailPermissionParent" onFocus={smartRefresh} />
            {valueOrNull('additionalContactInformation', <TextInput label="Toisen yhteyshenkilön tiedot" source="additionalContactInformation" onFocus={smartRefresh} sx={{ width: 400 }} />)}
            <SelectInput label="Kotinuorisotila" source="homeYouthClub" choices={youthClubs} format={v => youthClubs?.find(c => c.id === v)?.id ?? ''} onFocus={smartRefresh} sx={{ width: 400 }} />
            {formType === 'create' ?
                <SelectInput label="Kommunikaatiokieli" source="communicationsLanguage" choices={languages} validate={required()}
                    disabled={hiddenFormFields.includes('communicationsLanguage')} defaultValue="fi" sx={{ width: 400 }}
                />
                :
                valueOrNull('communicationsLanguage', <SelectInput label="Kommunikaatiokieli" source="communicationsLanguage" choices={languages} validate={required()} onFocus={smartRefresh} sx={{ width: 400 }} />)
            }
            <BooleanInput label="Kuvauslupa" source="photoPermission" defaultValue={false} onFocus={smartRefresh} />
            <FormDataConsumer>
                {({ formData }: { formData: any }) => {
                    return <SelectInput disabled={(formType === 'edit' && formData && (formData.status === Status.expired || formData.status === Status.extraEntriesOnly) && !isAdmin)} label="Tila" source="status" choices={statusChoices} validate={required()} onFocus={smartRefresh} sx={{ width: 400 }} />
                }}
            </FormDataConsumer>
            <FormDataConsumer>
                {({ formData }: { formData: any }) => {
                    return formData.status === Status.accepted && (formType === 'create' || (formData && formData.status !== Status.accepted)) && <SMSwarning/>
                }}
            </FormDataConsumer>
            {(formType === 'edit' && showExtraEntries) &&<FormDataConsumer>
                {({ formData }: { formData: any }) => {
                    return (
                        <Suspense fallback={<LoadingMessage />}>
                            <ExtraEntryLinkComponent juniorId={formData.id} />
                        </Suspense>
                    )
                }}
            </FormDataConsumer>}
            </>)}
        </SimpleForm>
    );
}

const qrCodeMessageStyle: CSSProperties = {
    color: '#000000',
    fontSize: '2em',
    fontFamily: 'sans-serif',
    textTransform: 'uppercase',
    margin: '5px'
};

const qrCodeContainerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    width: '400px',
};

const validQrCodeStyle: CSSProperties = {
    ...qrCodeContainerStyle,
    backgroundColor: '#6bc24a'
};

const expiredQrCodeStyle: CSSProperties = {
    ...qrCodeContainerStyle,
    backgroundColor: '#f7423a'
};

const languages = [
  { id: 'fi', name: 'suomi' },
  { id: 'sv', name: 'ruotsi' },
  { id: 'en', name: 'englanti' },
]

function valueOrNull(name: string, visibleValue: any) {
  return hiddenFormFields.includes(name) ? null : visibleValue;
}
