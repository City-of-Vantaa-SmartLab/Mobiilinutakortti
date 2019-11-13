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
import httpClient from '../httpClient';
import api from '../api';

let LogBookListView = (props) => {
    const [clubName, setClubName] = useState('');
    const [searchDate, setSearchDate] = useState('');

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

        </Container>
    )
}

LogBookListView = reduxForm({
    form: 'logBookListView'
})(LogBookListView);

const selector = formValueSelector('logBookListView');
LogBookListView = connect(state => {
    const date = selector(state, 'queryDate')
    return { selectedDate: date };
}, { showNotification })(LogBookListView);

export default LogBookListView;
