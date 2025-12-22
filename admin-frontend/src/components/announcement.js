import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@mui/material/styles';
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
    FormDataConsumer,
    GET_LIST
} from 'react-admin';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import styled from 'styled-components';
import { getActiveYouthClubOptions, messageTypeChoices, recipientChoicesForSms, NoBasePath } from '../utils';
import { Checkbox, FormControlLabel, Typography } from '@mui/material';
import { dataProvider } from '../providers/dataProvider';
import useAutoLogout from '../hooks/useAutoLogout';

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

const useStyles = makeStyles({
    selectInput: {
        minWidth: "300px"
    },
    hiddenInput: {
        display: "none"
    },
    note: {
        width: "100%",
        fontSize: "small"
    },
    noTopMargin: {
        marginTop: "0px"
    },
    contentSeparator: {
        marginTop: "8px",
        marginBottom: "8px"
    }
});

const SectionTitle = ({title}) => (
    <span style={{fontSize: "small"}}>{title}</span>
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
        <TextInput label="Viesti" source={`content.${props.langCode}`} validate={props.langCode === "fi" && required()} multiline/>
    </MsgSection>
};

const AnnouncementCreateTitle = () => (
    <span>Lähetä tiedotusviesti</span>
);

const AnnouncementCreateHelperText = ({msgType}) => (
    <p style={{'marginTop': '0px', 'fontSize': 'small'}}>{msgType === "email" ? "Viesti lähetetään vanhemmille, jotka ovat sallineet infosähköpostien lähettämisen." : "Viesti lähetetään henkilöille, jotka ovat sallineet infotekstiviestien lähettämisen."}</p>
);

const CustomToolbar = (props) => (
    <Toolbar {...props}>
        <SaveButton label="Lähetä" icon={<MailOutlineIcon />} disabled={props.pristine && !props.validating} />
    </Toolbar>
);

export const AnnouncementCreate = (props) => {
    const [ youthClubs, setYouthClubs ] = useState([]);
    const [ allSelected, setAllSelected ] = useState(false);
    const [ numberOfRecipients, setNumberOfRecipients ] = useState(0);
    const formDataRef = useRef(null);
    const updateTimeout = useRef(null);
    const notify = useNotify();
    const redirect = useRedirect();
    const classes = useStyles();

    useAutoLogout();

    useEffect(() => {
        const addYouthClubsToState = async () => {
            const youthClubOptions = await getActiveYouthClubOptions();
            setYouthClubs(youthClubOptions);
        };
        addYouthClubsToState();
    }, []);

    const onSuccess = () => {
        notify("Tiedote lähetetty");
        redirect("/");
    };

    const onCheckboxChange = (event, formData) => {
        setAllSelected(!!event.target.checked);
        formData.sendToAllYouthClubs = !!event.target.checked;
        updateRecipientCount();
    };

    const updateRecipientCount = () => {
        if (updateTimeout.current) {
            clearTimeout(updateTimeout.current);
        }

        updateTimeout.current = setTimeout(() => {
            const fd = formDataRef.current;
            if (fd && fd.msgType === 'sms' && (!fd.recipient || fd.recipient.length === 0)) {
                // Case: SMS with no recipients.
                setNumberOfRecipients(0);
            } else if (fd && fd.msgType && (!!fd.youthClub || fd.sendToAllYouthClubs)) {
                console.debug("Updating recipient count");
                dataProvider(GET_LIST, 'announcement', { data: fd }).then(
                    (response) => { setNumberOfRecipients(response.data) }
                )
            } else {
                // Case: Some mandatory data is missing.
                setNumberOfRecipients(0);
            }
        }, 100);
    }

    return (
        <Create title={<AnnouncementCreateTitle />} onSuccess={onSuccess} {...props}>
            <SimpleForm variant="standard" margin="normal" toolbar={<CustomToolbar/>}>
                <FormDataConsumer>
                    {({ formData }) => { formDataRef.current = formData }}
                </FormDataConsumer>
                <RadioButtonGroupInput source="msgType" choices={messageTypeChoices} label="Valitse lähetettävän viestin tyyppi" validate={required()} defaultValue={"sms"} onChange={updateRecipientCount} helperText={false}/>
                <FormDataConsumer className={classes.noTopMargin}>
                    {({ formData }) => {
                        return <AnnouncementCreateHelperText msgType={formData.msgType} />
                    }}
                </FormDataConsumer>
                <FormDataConsumer>
                    {({ formData }) => {
                        return <>{formData.msgType === "sms" && <CheckboxGroupInput source="recipient" choices={recipientChoicesForSms} label="Viestin vastaanottajat" onChange={updateRecipientCount} validate={formData.msgType === "sms" && required()} />}</>
                    }}
                </FormDataConsumer>
                <NoBasePath>
                    <Typography className={classes.note}>
                        Viestien vastaanottajat katsotaan nuoren kotinuorisotilan tai kuluneen kahden viikon aikana vierailemansa nuorisotilan perusteella.
                    </Typography>
                </NoBasePath>
                <FormDataConsumer>
                    {({ formData }) => {
                        return <FormControlLabel label="Lähetä kaikille nuorisotiloille" control={<Checkbox onChange={(event) => onCheckboxChange(event, formData)} color="primary"/>}/>
                    }}
                </FormDataConsumer>
                <SelectInput className={classes.selectInput + " " + classes.noTopMargin + (allSelected ? (" " + classes.hiddenInput) : '')} label="Koskien nuorisotilaa" source="youthClub" choices={youthClubs} validate={!allSelected && required()} onChange={updateRecipientCount} />
                <NoBasePath>
                    <div className={classes.contentSeparator}>
                        <Typography variant="subtitle1">
                            Viestin sisältö
                        </Typography>
                    </div>
                </NoBasePath>
                <MessageSectionForLanguage langCode="fi" />
                <MessageSectionForLanguage langCode="en" />
                <MessageSectionForLanguage langCode="sv" />
                <NoBasePath>
                    <Typography variant="body1">
                        Tietojen perusteella laskettu viestin vastaanottajien määrä: {numberOfRecipients}
                    </Typography>
                </NoBasePath>
            </SimpleForm>
        </Create>
    );
};
