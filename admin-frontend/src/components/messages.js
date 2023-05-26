import React, { useState, useEffect } from 'react';
import {
    SimpleForm,
    SelectInput,
    TextInput,
    required,
    Create,
    RadioButtonGroupInput,
    // SaveButton,
    // Toolbar
} from 'react-admin';
import { getYouthClubs, recipientChoices } from '../utils';

const CreateMessageTitle = () => (
    <span>Lähetä tekstiviesti</span>
);

const CreateMessageHelperText = () => (
  <p>Lähetä tekstiviesti käyttäjille seuraavilla hakuehdoilla:</p>
);

export const CreateMessage = (props) => {
    const [youthClubChoices, setYouthClubChoices] = useState([]);

    useEffect(() => {
        const addYouthClubsToState = async () => {
            const youthClubs = await getYouthClubs();
            setYouthClubChoices(youthClubs)
        };
        addYouthClubsToState();
    }, []);

    // const CustomToolbar = () => {
    //     return (
    //         <Toolbar>
    //             <SaveButton label="Lähetä" />
    //         </Toolbar>
    //     )
    // }

    return (
        <Create title={<CreateMessageTitle />} {...props}>
            <SimpleForm variant="standard" margin="normal" /* toolbar={<CustomToolbar />}*/ >
                <CreateMessageHelperText />
                <RadioButtonGroupInput source="recipient" choices={recipientChoices} label="Viestin vastaanottajat" validate={required()}/>
                <SelectInput label="Nuorisotila" source="youthClub" choices={youthClubChoices} validate={required()}/>
                <TextInput label="Viesti"  source="msgContent" validate={required()} inputProps={{ maxLength: 160 }}/>
            </SimpleForm>
        </Create>
    );
};
