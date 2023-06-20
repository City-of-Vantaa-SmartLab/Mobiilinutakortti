import React, { useState, useEffect } from 'react';
import {
    SimpleForm,
    SelectInput,
    CheckboxGroupInput,
    TextInput,
    required,
    Create,
    RadioButtonGroupInput,
    SaveButton,
    Toolbar,
    useNotify,
    useRedirect,
    FormDataConsumer
} from 'react-admin';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import styled from 'styled-components';
import { getYouthClubs, messageTypeChoices, recipientChoicesForSms } from '../utils';

const MsgSection = styled.section`
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    max-width: 30%;
    @media (max-width: 2015px) {
        max-width: 60%;
    }
    @media (max-width: 1150px) {
        max-width: 90%;
    }
`;

const SectionTitle = ({title}) => (
    <span>{title}</span>
);

const MessageSectionForLanguage = (props) => {
    let title = ""
    switch (props.langCode) {
        case "en":
            title = "Englanniksi:";
            break;
        case "sv":
            title = "Ruotsiksi:";
            break;
        default:
            title = "Suomeksi:";
    };

    return <MsgSection>
        <SectionTitle title={title} />
        <FormDataConsumer>
            {({ formData }) => {
                return <>{formData.msgType === "email" && <TextInput label="Otsikko" source={`title.${props.langCode}`} validate={(formData.msgType === "email" && props.langCode === "fi") && required()}/>}</>
            }}
        </FormDataConsumer>
        <TextInput label="Viesti" source={`content.${props.langCode}`}  validate={props.langCode === "fi" && required()} multiline/>
    </MsgSection>
};

const AnnouncementCreateTitle = () => (
    <span>Lähetä tiedotusviesti</span>
);

const AnnouncementCreateHelperText = ({msgType}) => (
    <p>{msgType === "email" ? "Viesti lähetetään vanhemmille, jotka ovat sallineet infosähköpostien lähettämisen." : "Viesti lähetetään henkilöille, jotka ovat sallineet infotekstiviestien lähettämisen."}</p>
);

const CustomToolbar = (props) => (
    <Toolbar {...props}>
        <SaveButton label="Lähetä" icon={<MailOutlineIcon />} disabled={props.pristine && !props.validating} />
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

    const selectHelperText = "Viestien vastaanottajat katsotaan nuoren kotinuorisotilan tai kuluneen kahden viikon aikana vierailemansa nuorisotilan perusteella";

    return (
        <Create title={<AnnouncementCreateTitle />} onSuccess={onSuccess} {...props}>
            <SimpleForm variant="standard" margin="normal" toolbar={<CustomToolbar/>}>
                <RadioButtonGroupInput source="msgType" choices={messageTypeChoices} label="Valitse lähetettävän viestin tyyppi" validate={required()} defaultValue={"sms"}/>
                <FormDataConsumer>
                    {({ formData }) => {
                        return <AnnouncementCreateHelperText msgType={formData.msgType}/>
                    }}
                </FormDataConsumer>
                <FormDataConsumer>
                    {({ formData }) => {
                        return <>{formData.msgType === "sms" && <CheckboxGroupInput source="recipient" choices={recipientChoicesForSms} label="Viestin vastaanottajat" validate={(formData.msgType === "sms") && required()} />}</>
                    }}
                </FormDataConsumer>
                <SelectInput sx={{ minWidth: '350px' }} label="Koskien nuorisotilaa" source="youthClub" choices={youthClubChoices} validate={required()} helperText={selectHelperText}/>
                <MessageSectionForLanguage langCode="fi" />
                <MessageSectionForLanguage langCode="en" />
                <MessageSectionForLanguage langCode="sv" />
            </SimpleForm>
        </Create>
    );
};
