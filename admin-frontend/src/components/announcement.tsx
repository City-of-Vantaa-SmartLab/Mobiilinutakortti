import { useState, useEffect, useRef } from 'react';
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
    CreateProps,
    FormDataConsumerRenderParams
} from 'react-admin';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import styled from 'styled-components';
import { getActiveYouthClubOptions, messageTypeChoices, recipientChoicesForSms, NoBasePath } from '../utils';
import { Checkbox, FormControlLabel, Typography } from '@mui/material';
import { announcementProvider } from '../providers/announcementProvider';
import useAutoLogout from '../hooks/useAutoLogout';

const MsgSection = styled.section`
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    width: 100%;
    @media (max-width: 2015px) {
        max-width: 75%;
    }
    @media (max-width: 1150px) {
        max-width: 90%;
    }
`;

const SectionTitle = ({title}: {title: string}) => (
    <span style={{fontSize: "small", marginBottom: "5px"}}>{title}</span>
);

const MessageSectionForLanguage = (props: { langCode: string }) => {
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
    <span>Tiedotus</span>
);

const AnnouncementCreateHelperText = ({msgType}) => (
    <p style={{'marginTop': '0px', 'fontSize': 'small'}}>{msgType === "email" ? "Viesti lähetetään vanhemmille, jotka ovat sallineet infosähköpostien lähettämisen." : "Viesti lähetetään henkilöille, jotka ovat sallineet infotekstiviestien lähettämisen."}</p>
);

const CustomToolbar = (props: any) => (
    <Toolbar {...props}>
        <SaveButton label="Lähetä" icon={<MailOutlineIcon />} disabled={props.pristine && !props.validating} />
    </Toolbar>
);

export const AnnouncementCreate = (props: CreateProps) => {
    const [ youthClubs, setYouthClubs ] = useState([]);
    const [ allSelected, setAllSelected ] = useState(false);
    const [ numberOfRecipients, setNumberOfRecipients ] = useState(0);
    const formDataRef = useRef(null);
    const updateTimeout = useRef(null);
    const notify = useNotify();
    const redirect = useRedirect();

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

    const onCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, formData: any) => {
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
                announcementProvider.getList({ data: fd } as any).then(
                    (response: any) => { setNumberOfRecipients(response.data) }
                )
            } else {
                // Case: Some mandatory data is missing.
                setNumberOfRecipients(0);
            }
        }, 100);
    }

    return (
        <Create title={<AnnouncementCreateTitle />} mutationOptions={{ onSuccess }} {...props}>
            <SimpleForm toolbar={<CustomToolbar/>}>
                <FormDataConsumer>
                    {({ formData }: FormDataConsumerRenderParams) => { formDataRef.current = formData; return null; }}
                </FormDataConsumer>
                <RadioButtonGroupInput source="msgType" choices={messageTypeChoices} label="Valitse lähetettävän viestin tyyppi" validate={required()} defaultValue={"sms"} onChange={updateRecipientCount} helperText={false}/>
                <FormDataConsumer sx={{ marginTop: 0 }}>
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
                    <Typography sx={{ width: '100%', fontSize: 'small' }}>
                        Viestien vastaanottajat katsotaan nuoren kotinuorisotilan tai kuluneen kahden viikon aikana vierailemansa nuorisotilan perusteella.
                    </Typography>
                </NoBasePath>
                <FormDataConsumer>
                    {({ formData }) => {
                        return <FormControlLabel label="Lähetä kaikille nuorisotiloille" control={<Checkbox onChange={(event) => onCheckboxChange(event, formData)} color="primary"/>}/>
                    }}
                </FormDataConsumer>
                <SelectInput sx={{ minWidth: '300px', marginTop: 1, display: allSelected ? 'none' : undefined }} label="Koskien nuorisotilaa" source="youthClub" choices={youthClubs} validate={!allSelected && required()} onChange={updateRecipientCount} />
                <NoBasePath>
                    <div style={{ marginTop: '8px', marginBottom: '8px' }}>
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
