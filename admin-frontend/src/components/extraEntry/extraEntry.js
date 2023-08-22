import React, { useCallback, useEffect, useState } from 'react';
import { useRefresh } from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { MenuItem, Select } from '@material-ui/core';
import { Add, CancelOutlined } from '@material-ui/icons';
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
    CREATE
} from 'react-admin';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { getExtraEntryTypes, statusChoices } from '../../utils';
import { ExtraEntryTable, ExtraEntryButton, EmptyChoicesText } from '../styledComponents/extraEntry';
import { extraEntryProvider } from '../../providers';
import { httpClientWithRefresh } from '../../httpClients';

const useStyles = makeStyles({
    selectInput: {
        width: "fit-content",
        minWidth: "200px"
    }
});

export const ExtraEntryList = (props) => {
    const [extraEntryTypeChoices, setExtraEntryTypeChoices] = useState([]);

    useEffect(() => {
        const addExtraEntryTypesToState = async () => {
            const extraEntryTypes = await getExtraEntryTypes();
            const typesWithCustomOptions = [...extraEntryTypes, {id: -1, name: "Ei lisämerkintöjä"}, {id: -2, name: "Mikä tahansa lisämerkintä"}];
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

const CustomToolbar = ({cancel, ...others}) => (
    <Toolbar {...others}>
        <Button label="Takaisin" onClick={cancel} alignIcon="left"><ArrowBackIcon /></Button>
    </Toolbar>
);

export const ExtraEntryEdit = (props) => {
    const [newExtraEntryType, setNewExtraEntryType] = useState(-1);
    const [extraEntryTypeChoices, setExtraEntryTypeChoices] = useState([]);
    const notify = useNotify();
    const notifyError = useCallback((msg) => notify(msg, 'error'), [notify]);
    const refresh = useRefresh();
    const redirect = useRedirect();
    const classes = useStyles();

    useEffect(() => {
        const addExtraEntryTypesToState = async () => {
            const extraEntryTypes = await getExtraEntryTypes();
            setExtraEntryTypeChoices(extraEntryTypes);
        };
        addExtraEntryTypesToState();
    }, []);

    const redirectToList = () => {
        redirect("/extraEntry");
    };

    const handleDelete = async (eeId) => {
        const response = await extraEntryProvider(DELETE, {data: {extraEntryId: eeId}}, httpClientWithRefresh);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            notifyError('Virhe lisämerkinnän poistamisessa');
        } else {
            notify('Lisämerkintä poistettu', 'success');
            refresh();
        }
    };

    const handleSelectChange = (e) => {
        setNewExtraEntryType(e.target.value);
    };

    const handleAdd = async (juniorId) => {
        const response = await extraEntryProvider(CREATE, {data: {juniorId: juniorId, extraEntryTypeId: newExtraEntryType}}, httpClientWithRefresh);
        if (response.statusCode < 200 || response.statusCode >= 300) {
            notifyError('Virhe lisämerkinnän lisäämisessä');
        } else {
            notify('Lisämerkintä lisätty', 'success');
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

                        const selectedTypes = formData.extraEntries.map((entry) => {
                            return entry.extraEntryType?.id;
                        });
                        const availableChoices = extraEntryTypeChoices.filter(item => !selectedTypes.includes(item.id));

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
                                        <th><a href={`/#/junior/${formData.id}`}>Muokkaa nuoren tietoja</a></th>
                                    </tr>
                                </tbody>
                            </ExtraEntryTable>
                            <ExtraEntryTable>
                                <thead>
                                    <tr><th>Lisämerkinnät</th></tr>
                                </thead>
                                <tbody>
                                    {formData.extraEntries.map((ee) => {
                                        return <tr key={ee.id}>
                                            <td>{ee.extraEntryType.name}</td>
                                            <td>
                                                <ExtraEntryButton value={ee.id} onClick={() => handleDelete(ee.id)} type="button">
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
                                            {availableChoices.length > 0 ? <Select
                                                className={classes.selectInput}
                                                onChange={handleSelectChange}
                                                value={newExtraEntryType}
                                            >
                                                <MenuItem value={-1}></MenuItem>
                                                {availableChoices.map(ac => (
                                                    <MenuItem key={ac.id} value={ac.id}>{ac.name}</MenuItem>
                                                ))}
                                            </Select> : <EmptyChoicesText>Ei valittavia merkintöjä</EmptyChoicesText>}
                                        </td>
                                        <td>
                                            <ExtraEntryButton onClick={() => handleAdd(formData.id)} type="button" disabled={newExtraEntryType === -1}>
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
