import React, { useState } from 'react';
import { showNotification, DateInput } from 'react-admin';
import { connect } from 'react-redux';
import { reduxForm, formValueSelector } from 'redux-form';
import { Card, Button, CardContent, CardHeader, TextField, DialogTitle } from '@material-ui/core';
import httpClient from '../httpClient';
import api from '../api';
import styled from 'styled-components';
import { genderChoices } from '../utils';

const Container = styled.div`
    height: 100%;
    width: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
`;

const VerticalCardPadding = styled.div`
    padding-top: 40px;
`;

const StyledDialogTitle = styled(DialogTitle)`
    padding-left: 0px !important;
`;

const LogBookTextFieldContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: space-between;
`;

const LogBookCard = styled(Card)`
    width: 800px;
`;

const LogBookCardHeader = styled(CardHeader)`
    text-align: center;
`;

const LogBookCardContent = styled(CardContent)`
    margin: 0px 30px;
`;

const LogBookCardContentSelect = styled(LogBookCardContent)`
    display: felx;
    justify-content: center;
`;

const LogBookTextField = styled(TextField)`
    width:100px;
`;

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
            await httpClient(url, options)
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
