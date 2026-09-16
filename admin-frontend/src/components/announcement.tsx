import { useState, useEffect, useRef } from 'react'
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
} from 'react-admin'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import styled from 'styled-components'
import { getActiveYouthClubOptions, messageTypeChoices, recipientChoicesForSms } from '../utils'
import { Checkbox, FormControlLabel, Typography } from '@mui/material'
import { announcementProvider } from '../providers/announcementProvider'
import useAutoLogout from '../hooks/useAutoLogout'

const RecipientCountUpdater = (props: {
    allSelected: boolean,
    formData: any,
    onUpdate: (formData: any, useAllYouthClubs: boolean) => void,
}) => {
    const recipientKey = Array.isArray(props.formData.recipient) ? props.formData.recipient.join(',') : props.formData.recipient

    useEffect(() => {
        props.onUpdate(props.formData, props.allSelected)
    }, [props.allSelected, props.formData.msgType, props.formData.youthClub, recipientKey])

    return null
}

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
`

const SectionTitle = ({title}: {title: string}) => (
    <span style={{fontSize: "small", marginBottom: "5px"}}>{title}</span>
)

const MessageSectionForLanguage = (props: { langCode: string }) => {
    let title = ""
    switch (props.langCode) {
        case "en":
            title = "Englanniksi:"
            break
        case "sv":
            title = "Ruotsiksi:"
            break
        default:
            title = "Suomeksi:"
    }

    return <MsgSection>
        <SectionTitle title={title} />
        <FormDataConsumer>
            {({ formData }) => {
                return <>{formData.msgType === "email" && <TextInput label="Otsikko" source={`title.${props.langCode}`} validate={(formData.msgType === "email" && props.langCode === "fi") ? required() : undefined}/>}</>
            }}
        </FormDataConsumer>
        <TextInput label="Viesti" source={`content.${props.langCode}`} validate={props.langCode === "fi" ? required() : undefined} multiline/>
    </MsgSection>
}

const AnnouncementCreateTitle = () => (
    <span>Tiedotus</span>
)

const CustomToolbar = (props: any) => (
    <Toolbar {...props}>
        <SaveButton label="Lähetä" icon={<MailOutlineIcon />} disabled={props.pristine && !props.validating} />
    </Toolbar>
)

export const AnnouncementCreate = (props: CreateProps) => {
    const [ youthClubs, setYouthClubs ] = useState([])
    const [ allSelected, setAllSelected ] = useState(false)
    const [ numberOfRecipients, setNumberOfRecipients ] = useState(0)
    const updateTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
    const requestSequence = useRef(0)
    const notify = useNotify()
    const redirect = useRedirect()

    useAutoLogout()

    useEffect(() => {
        const addYouthClubsToState = async () => {
            const youthClubOptions = await getActiveYouthClubOptions()
            setYouthClubs(youthClubOptions)
        }
        addYouthClubsToState()

        return () => {
            if (updateTimeout.current) {
                clearTimeout(updateTimeout.current)
            }
        }
    }, [])

    const onSuccess = () => {
        notify("Tiedote lähetetty")
        redirect("/")
    }

    const onCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAllSelected(!!event.target.checked)
    }

    const updateRecipientCount = (formData: any, useAllYouthClubs: boolean) => {
        if (updateTimeout.current) {
            clearTimeout(updateTimeout.current)
        }

        const requestId = ++requestSequence.current
        updateTimeout.current = setTimeout(() => {
            if (formData && formData.msgType === 'sms' && (!formData.recipient || formData.recipient.length === 0)) {
                // Case: SMS with no recipients.
                setNumberOfRecipients(0)
            } else if (formData && formData.msgType && (!!formData.youthClub || useAllYouthClubs)) {
                console.debug("Updating recipient count")
                announcementProvider.getList({ data: { ...formData, sendToAllYouthClubs: useAllYouthClubs } }).then(
                    (response: any) => {
                        if (requestId === requestSequence.current) {
                            setNumberOfRecipients(Number(response.data) || 0)
                        }
                    }
                ).catch(() => {
                    if (requestId === requestSequence.current) {
                        setNumberOfRecipients(0)
                    }
                })
            } else {
                // Case: Some mandatory data is missing.
                setNumberOfRecipients(0)
            }
        }, 100)
    }

    return (
        <Create title={<AnnouncementCreateTitle />} mutationOptions={{ onSuccess }} transform={(data: any) => ({
            ...data,
            sendToAllYouthClubs: allSelected,
            youthClub: allSelected ? null : data.youthClub,
        }) as any} {...props}>
            <SimpleForm toolbar={<CustomToolbar/>}>
                <FormDataConsumer>
                    {({ formData }: FormDataConsumerRenderParams) => <RecipientCountUpdater formData={formData} allSelected={allSelected} onUpdate={updateRecipientCount} />}
                </FormDataConsumer>
                <RadioButtonGroupInput source="msgType" choices={messageTypeChoices} label="Valitse lähetettävän viestin tyyppi" validate={required()} defaultValue={"sms"} helperText={false}/>
                <Typography sx={{ width: '100%', fontSize: 'small' }}>
                    <FormDataConsumer>
                        {({ formData }: FormDataConsumerRenderParams) => {
                            return formData.msgType === "email" ? "Viesti lähetetään vanhemmille, jotka ovat sallineet infosähköpostien lähettämisen." : "Viesti lähetetään henkilöille, jotka ovat sallineet infotekstiviestien lähettämisen."
                        }}
                    </FormDataConsumer>
                </Typography>
                <FormDataConsumer>
                    {({ formData }) => {
                        return <>{formData.msgType === "sms" && <CheckboxGroupInput source="recipient" choices={recipientChoicesForSms} label="Viestin vastaanottajat" validate={formData.msgType === "sms" ? required() : undefined} helperText={false} />}</>
                    }}
                </FormDataConsumer>
                <Typography sx={{ width: '100%', fontSize: 'small', mt: '1rem' }}>
                    Viestien vastaanottajat katsotaan nuoren kotinuorisotilan tai kuluneen kahden viikon aikana vierailemansa nuorisotilan perusteella.
                </Typography>
                <FormControlLabel label="Lähetä kaikille nuorisotiloille" control={<Checkbox checked={allSelected} onChange={onCheckboxChange} color="primary"/>}/>
                <SelectInput sx={{ minWidth: '300px', marginTop: 1, display: allSelected ? 'none' : undefined }} label="Koskien nuorisotilaa" source="youthClub" choices={youthClubs} validate={!allSelected ? required() : undefined} />
                <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                    <Typography variant="subtitle1">
                        Viestin sisältö
                    </Typography>
                </div>
                <MessageSectionForLanguage langCode="fi" />
                <MessageSectionForLanguage langCode="en" />
                <MessageSectionForLanguage langCode="sv" />
                <Typography variant="body1">
                    Tietojen perusteella laskettu viestin vastaanottajien määrä: {numberOfRecipients}
                </Typography>
            </SimpleForm>
        </Create>
    )
}
