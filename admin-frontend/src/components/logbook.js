import React, { useState } from 'react';
import { showNotification, DateInput } from 'react-admin';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { Button } from '@material-ui/core';
import {
    Container,
    LogBookCard,
    LogBookCardHeader,
    LogBookCardContent,
    LogBookTextField,
    LogBookTextFieldContainer,
    LogBookCardContentSelect,
    VerticalCardPadding,
    StyledDialogTitle
} from './styledComponents/logbook';
import { httpClientWithResponse } from '../httpClients';
import api from '../api';
import { genderChoices } from '../utils';


let LogBookView = (props) => {
    const [clubName, setClubName] = useState('');
    const [ages, setAges] = useState([]);
    const [genders, setGenders] = useState([]);
    const [searchDate, setSearchDate] = useState('');

    const getGenderTitles = (keyValueArray) => {
        keyValueArray.map(pair => pair.key = genderChoices.find(g => g.id === pair.key).name);
        return keyValueArray;
    }

    const resetState = () => {
        setClubName('');
        setAges([]);
        setGenders([]);
        setSearchDate('');
    }

    const mapKeyValueToUI = (keyValueArray) => {
        const UI = [];
        keyValueArray.forEach(pair => {
            UI.push(
                <LogBookTextField
                    key={pair.key}
                    label={pair.key}
                    defaultValue={pair.value}
                    margin="normal"
                    variant="filled"
                    InputProps={{
                        readOnly: true,
                    }}
                />
            );
        });
        return UI;
    }

    const getLogBookEntry = async () => {
        const date = new Date(props.selectedDate);
        if (!isNaN(date.getTime())) {
            const url = api.youthClub.logBook;
            const body = JSON.stringify({
                clubId: props.match.params.youthClubId,
                date: date
            });
            const options = {
                method: 'POST',
                body
            };
            resetState();
            await httpClientWithResponse(url, options)
                .then(response => {
                    if (response.statusCode < 200 || response.statusCode >= 300) {
                        const { showNotification } = props;
                        showNotification(response.message, "warning");
                    } else {
                        setSearchDate(date.toLocaleDateString());
                        setClubName(response.clubName);
                        setGenders(mapKeyValueToUI(getGenderTitles(response.genders)));
                        setAges(mapKeyValueToUI(response.ages));
                    }
                });
        }
    }

    return (
        <Container>
            <LogBookCard>
                <LogBookCardHeader title="Valitse Päivämäärä" />
                <LogBookCardContentSelect>
                    <DateInput label="Päivämäärä" source="queryDate" />
                    <Button onClick={getLogBookEntry} >Hae</Button>
                </LogBookCardContentSelect>
            </LogBookCard>
            <VerticalCardPadding />

            {clubName !== '' &&
                <LogBookCard>
                    <LogBookCardHeader title={clubName} subheader={searchDate} />
                    <LogBookCardContent>
                        <StyledDialogTitle>Sukupuoli</StyledDialogTitle>
                        <LogBookTextFieldContainer>
                            {genders}
                        </LogBookTextFieldContainer>
                        <StyledDialogTitle>Ikä</StyledDialogTitle>
                        <LogBookTextFieldContainer>
                            {ages}
                        </LogBookTextFieldContainer>
                    </LogBookCardContent>
                </LogBookCard>
            }
        </Container>
    )
}

LogBookView = reduxForm({
    form: 'logBookView'
})(LogBookView);

const selector = formValueSelector('logBookView');
LogBookView = connect(state => {
    const date = selector(state, 'queryDate')
    return { selectedDate: date };
}, { showNotification })(LogBookView);

export default LogBookView;
