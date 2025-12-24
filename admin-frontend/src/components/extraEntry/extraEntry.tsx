import { useCallback, useEffect, useState, useRef } from 'react';
import { useRefresh } from 'react-admin';
import { MenuItem, Select, Card, CardContent, SelectChangeEvent } from '@mui/material';
import { Add, CancelOutlined } from '@mui/icons-material';
import {
    List,
    Datagrid,
    EditButton,
    TextField,
    SimpleForm,
    TextInput,
    SelectInput,
    Filter,
    Pagination,
    ArrayField,
    SingleFieldList,
    ChipField,
    Edit,
    FormDataConsumer,
    Button,
    useRedirect,
    Toolbar,
    useNotify,
    DELETE,
    CREATE,
    ListProps,
    EditProps
} from 'react-admin';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getEntryTypes, statusChoices, Status, hrefFragmentToJunior } from '../../utils';
import { ExtraEntryTable, ExtraEntryButton, EmptyChoicesText } from './extraEntryStyledComponents';
import { extraEntryProvider } from '../../providers';
import { httpClientWithRefresh } from '../../httpClients';
import { PhoneNumberField } from '../phoneNumberField';
import useAutoLogout from '../../hooks/useAutoLogout';

export const ExtraEntryList = (props: ListProps) => {
    const [extraEntryTypeChoices, setExtraEntryTypeChoices] = useState([]);
    const [entryPermitTypeChoices, setEntryPermitTypeChoices] = useState([]);
    const [choicesLoaded, setChoicesLoaded] = useState(false);
    const autoFocusSource = useRef(null);

    useAutoLogout();

    useEffect(() => {
        const addTypesToState = async () => {
            const entryTypes = await getEntryTypes();
            const eeTypesWithCustomOptions = [...entryTypes, {id: -1, name: "Ei lisämerkintöjä"}, {id: -2, name: "Mikä tahansa lisämerkintä"}];
            const permitTypesWithCustomOptions = [...entryTypes, {id: -1, name: "Ei lupia"}, {id: -2, name: "Mikä tahansa lupa"}];
            setExtraEntryTypeChoices(eeTypesWithCustomOptions);
            setEntryPermitTypeChoices(permitTypesWithCustomOptions);
            setChoicesLoaded(true);
        };
        addTypesToState();
    }, []);

    const CustomPagination = (props: any) => <Pagination rowsPerPageOptions={[5, 10, 25, 50]} {...props} />;

    // Since React re-renders after search debounce, the input focus would always be set to the last filter input component with auto focus. Therefore we manually keep track of what was the last input the user typed in to set auto focus correctly. We use useRef and not useState to prevent re-rendering on first keypress.
    const checkAutoFocus = (source: string) => {
        if (!autoFocusSource.current) return true;
        return autoFocusSource.current === source;
    }

    const setAutoFocus = (source: string) => {
        autoFocusSource.current = source;
    }

    const ExtraEntryFilter = (props: any) => (
        <Filter {...props}>
            <TextInput label="Nimi" source="name" autoFocus={checkAutoFocus("name")} onInput={() => setAutoFocus("name")} />
            <TextInput label="Puhelinnumero" source="phoneNumber" autoFocus={checkAutoFocus("phoneNumber")} onInput={() => setAutoFocus("phoneNumber")} />
            <SelectInput label="Lupatyyppi" source="entryPermitType" choices={entryPermitTypeChoices} alwaysOn onChange={() => setAutoFocus("none")} sx={{ minWidth: 250 }} />
            <SelectInput label="Lisämerkintätyyppi" source="extraEntryType" choices={extraEntryTypeChoices} alwaysOn onChange={() => setAutoFocus("none")} sx={{ minWidth: 250 }} />
        </Filter>
    );

    return (<>
        <Card>
          <CardContent>
            <p>Nuoret, joiden tila on "{statusChoices.find(s => s.id === Status.extraEntriesOnly).name}" ja joilla ei ole ainuttakaan lisämerkintää (tai lupaa), poistuvat järjestelmästä automaattisesti joka yö tehtävässä ylläpitosiivouksessa. Samalla tarkistetaan myös onko lisämerkinnän ikäraja tullut vastaan, ja merkintä poistetaan automaattisesti jos on.</p>
            <p>Huomaa myös, että toiminto "Poista vanhat käyttäjät" siirtää "{statusChoices.find(s => s.id === Status.extraEntriesOnly).name}" -tilaan nuoret, joilla on lisämerkintöjä.</p>
            <p>Nuorille, jotka ovat tilassa "{statusChoices.find(s => s.id === Status.expired).name}", ei voi lisätä merkintöjä.</p>
            <p>Lisämerkintä- ja lupatyyppisuodattimet ovat TAI-tyyppisiä, muut JA-tyyppisiä.</p>
          </CardContent>
        </Card>
        <List title="Lisämerkinnät" pagination={<CustomPagination />} filters={choicesLoaded ? <ExtraEntryFilter /> : null} debounce={500} exporter={false} {...props}
            filterDefaultValues={{ entryPermitType: -2, extraEntryType: -2 }}>
            <Datagrid bulkActionButtons={false} rowClick={false}>
                <TextField label="Nimi" source="displayName" />
                <TextField source="age" label="Ikä" />
                <PhoneNumberField label="Puhelinnumero" source="phoneNumber" />
                <ArrayField label="Lisämerkinnät" source="extraEntries">
                    <SingleFieldList linkType={false} >
                        <ChipField source="entryType.name" size="small" />
                    </SingleFieldList>
                </ArrayField>
                <ArrayField label="Luvat" source="entryPermits">
                    <SingleFieldList linkType={false} >
                        <ChipField source="entryType.name" size="small" />
                    </SingleFieldList>
                </ArrayField>
                <EditButton />
            </Datagrid>
        </List>
    </>)
};

const CustomToolbar = ({cancel, ...others}: {cancel: () => void, [key: string]: any}) => (
    <Toolbar {...others}>
        <Button label="Takaisin" onClick={cancel} alignIcon="left"><ArrowBackIcon /></Button>
    </Toolbar>
);

export const ExtraEntryEdit = (props: EditProps) => {
    useAutoLogout();
    const [newExtraEntryType, setNewExtraEntryType] = useState(-1);
    const [newEntryPermitType, setNewEntryPermitType] = useState(-1);
    const [entryTypeChoices, setEntryTypeChoices] = useState([]);

    const notify = useNotify();
    const notifyError = useCallback((msg: string) => notify(msg, { type: 'error' }), [notify]);
    const refresh = useRefresh();
    const redirect = useRedirect();

    useEffect(() => {
        const addExtraEntryTypesToState = async () => {
            const entryTypes = await getEntryTypes();
            setEntryTypeChoices(entryTypes);
        };
        addExtraEntryTypesToState();
    }, []);

    const redirectToList = () => {
        redirect("/extraEntry");
    };

    const handleDelete = async (eeId: string, isPermit: boolean) => {
        const response = await extraEntryProvider(DELETE, {data: {deletableId: eeId, isPermit: isPermit}}, httpClientWithRefresh);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            notifyError('Virhe merkinnän poistamisessa');
        } else {
            const message = response.data.message || 'Merkintä poistettu';
            notify(message, { type: 'success' });
            refresh();
        }
    };

    const handleExtraEntryChange = (e: SelectChangeEvent<number>) => {
        setNewExtraEntryType(Number(e.target.value));
    };

    const handlePermitChange = (e: SelectChangeEvent<number>) => {
        setNewEntryPermitType(Number(e.target.value));
    };

    const handleAdd = async (juniorId: string, isPermit: boolean) => {
        const newType = isPermit ? newEntryPermitType : newExtraEntryType;
        const response = await extraEntryProvider(CREATE, {data: {juniorId: juniorId, entryTypeId: newType, isPermit: isPermit}}, httpClientWithRefresh);
         if (response.statusCode < 200 || response.statusCode >= 300) {
            notifyError('Virhe merkinnän lisäämisessä');
        } else {
            isPermit ? setNewEntryPermitType(-1) : setNewExtraEntryType(-1);
            const message = response.data.message || 'Merkintä lisätty';
            notify(message, { type: 'success' });
            refresh();
        }
    };

    return (
        <Edit title="Muokkaa lisämerkintöjä" {...props}>
            <SimpleForm margin="normal"  toolbar={<CustomToolbar cancel={redirectToList}/>}>
                <FormDataConsumer>
                    {({ formData }) => {
                        const status = statusChoices.find((item) => item.id === formData.status);
                        const formattedBirthday = new Date(formData.birthday).toLocaleDateString("fi-FI");

                        const selectedEeTypes = formData.extraEntries.map((entry: any) => {
                            return entry.entryType?.id;
                        });
                        const availableEeChoices = entryTypeChoices.filter(item => !selectedEeTypes.includes(item.id));

                        const selectedPermitTypes = formData.entryPermits.map((entry: any) => {
                            return entry.entryType?.id;
                        });
                        const availablePermitChoices = entryTypeChoices.filter(item => (!selectedEeTypes.includes(item.id) && !selectedPermitTypes.includes(item.id)));

                        return <>
                            <ExtraEntryTable>
                                <tbody>
                                    <tr>
                                        <th>Nimi</th>
                                        <td>{formData.displayName}</td>
                                    </tr>
                                    <tr>
                                        <th>Puhelinnumero</th>
                                        <td>{formData.phoneNumber}</td>
                                    </tr>
                                    <tr>
                                        <th>Syntymäpäivä</th>
                                        <td>{formattedBirthday}</td>
                                    </tr>
                                    <tr>
                                        <th>Ikä vuosina</th>
                                        <td>{formData.age}</td>
                                    </tr>
                                    <tr>
                                        <th>Tila</th>
                                        <td>{status.name}</td>
                                    </tr>
                                    <tr>
                                        <th><a href={hrefFragmentToJunior(formData.id)}>Muokkaa nuoren tietoja</a></th>
                                    </tr>
                                </tbody>
                            </ExtraEntryTable>

                            <ExtraEntryTable>
                                <thead>
                                    <tr><th>Lisämerkinnät</th></tr>
                                </thead>
                                <tbody>
                                    {formData.extraEntries.map((ee: any) => {
                                        return <tr key={ee.id}>
                                            <td>{ee.entryType.name}</td>
                                            <td>
                                                <ExtraEntryButton value={ee.id} onClick={() => handleDelete(ee.id, false)} type="button">
                                                    Poista <CancelOutlined />
                                                </ExtraEntryButton>
                                            </td>
                                        </tr>
                                    })}
                                </tbody>
                            </ExtraEntryTable>
                            <ExtraEntryTable>
                                <tbody>
                                    <tr>
                                        <td>
                                            {availableEeChoices.length > 0 && status.id !== Status.expired ? <Select
                                                sx={{ width: 'fit-content', minWidth: '200px' }}
                                                onChange={handleExtraEntryChange}
                                                value={newExtraEntryType}
                                            >
                                                <MenuItem value={-1}></MenuItem>
                                                {availableEeChoices.map(ac => (
                                                    <MenuItem key={ac.id} value={ac.id}>{ac.name}</MenuItem>
                                                ))}
                                            </Select> : <EmptyChoicesText>{status.id === Status.expired ? status.name : 'Ei valittavia lisämerkintöjä'}</EmptyChoicesText>}
                                        </td>
                                        <td>
                                            <ExtraEntryButton onClick={() => handleAdd(formData.id, false)} type="button"
                                                disabled={newExtraEntryType === -1 || availableEeChoices.length === 0 || status.id === Status.expired}>
                                                Lisää <Add />
                                            </ExtraEntryButton>
                                        </td>
                                    </tr>
                                </tbody>
                            </ExtraEntryTable>

                            <ExtraEntryTable>
                                <thead>
                                    <tr><th>Luvat</th></tr>
                                </thead>
                                <tbody>
                                    {formData.entryPermits.map((permit: any) => {
                                        return <tr key={permit.id}>
                                            <td>{permit.entryType.name}</td>
                                            <td>
                                                <ExtraEntryButton value={permit.id} onClick={() => handleDelete(permit.id, true)} type="button">
                                                    Poista <CancelOutlined />
                                                </ExtraEntryButton>
                                            </td>
                                        </tr>
                                    })}
                                </tbody>
                            </ExtraEntryTable>
                            <ExtraEntryTable>
                                <tbody>
                                    <tr>
                                        <td>
                                            {availablePermitChoices.length > 0 && status.id !== Status.expired ? <Select
                                                sx={{ width: 'fit-content', minWidth: '200px' }}
                                                onChange={handlePermitChange}
                                                value={newEntryPermitType}
                                            >
                                                <MenuItem value={-1}></MenuItem>
                                                {availablePermitChoices.map(ac => (
                                                    <MenuItem key={ac.id} value={ac.id}>{ac.name}</MenuItem>
                                                ))}
                                            </Select> : <EmptyChoicesText>{status.id === Status.expired ? status.name : 'Ei valittavia lupia'}</EmptyChoicesText>}
                                        </td>
                                        <td>
                                            <ExtraEntryButton onClick={() => handleAdd(formData.id, true)} type="button"
                                                disabled={newEntryPermitType === -1 || availablePermitChoices.length === 0 || status.id === Status.expired}>
                                                Lisää <Add />
                                            </ExtraEntryButton>
                                        </td>
                                    </tr>
                                </tbody>
                            </ExtraEntryTable>
                        </>
                    }}
                </FormDataConsumer>
            </SimpleForm>
        </Edit>
    );
};
