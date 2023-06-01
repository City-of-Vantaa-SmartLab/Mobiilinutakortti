import React, { useState, useEffect } from 'react';
import {
    SimpleForm,
    SelectInput,
    TextInput,
    required,
    Create,
    RadioButtonGroupInput,
    SaveButton,
    Toolbar,
    useNotify,
    useRedirect
} from 'react-admin';
import { getYouthClubs, recipientChoices } from '../utils';

const AnnouncementCreateTitle = () => (
    <span>Lähetä tiedotusviesti</span>
);

const AnnouncementCreateHelperText = () => (
    <p>
        Tiedotusviesti lähetetään henkilöille, jotka ovat sallineet tiedotustekstiviestien lähettämisen.
        <br/>
        Valitse vastaanottajat seuraavilla hakuehdoilla:
    </p>
);

const CustomToolbar = (props) => (
    <Toolbar {...props}>
        <SaveButton label="Lähetä" />
    </Toolbar>
);

export const AnnouncementCreate = (props) => {
    const [youthClubChoices, setYouthClubChoices] = useState([]);
    const notify = useNotify();
    const redirect = useRedirect();

    useEffect(() => {
        const addYouthClubsToState = async () => {
            const youthClubs = await getYouthClubs();
            setYouthClubChoices(youthClubs);
        };
        addYouthClubsToState();
    }, []);

    const onSuccess = () => {
        notify('Viesti lähetetty');
        redirect('/');
    };

    return (
        <Create title={<AnnouncementCreateTitle />} onSuccess={onSuccess} {...props}>
            <SimpleForm variant="standard" margin="normal" toolbar={<CustomToolbar/>} >
                <AnnouncementCreateHelperText />
                <RadioButtonGroupInput source="recipient" choices={recipientChoices} label="Viestin vastaanottajat" validate={required()}/>
                <SelectInput label="Nuorisotila" source="youthClub" choices={youthClubChoices} validate={required()}/>
                <TextInput label="Viesti suomeksi" source="content.fi" validate={required()} inputProps={{ maxLength: 160 }}/>
                <TextInput label="Viesti englanniksi" source="content.en" inputProps={{ maxLength: 160 }}/>
                <TextInput label="Viesti ruotsiksi" source="content.sv" inputProps={{ maxLength: 160 }}/>
            </SimpleForm>
        </Create>
    );
};
