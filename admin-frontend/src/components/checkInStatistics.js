import React, { useState } from 'react';
import { DateInput, useNotify } from 'react-admin';
import { Form } from 'react-final-form';
import { Button } from '@material-ui/core';
import {
    Container,
    CheckInLogCard,
    CheckInLogCardHeader,
    CheckInLogCardContent,
    CheckInLogTextField,
    CheckInLogTextFieldContainer,
    CheckInLogCardContentSelect,
    VerticalCardPadding,
    StyledDialogTitle
} from './styledComponents/checkInLog';
import { Typography } from '@material-ui/core';
import { httpClientWithRefresh } from '../httpClients';
import api from '../api';
import useAutoLogout from '../hooks/useAutoLogout';

const labelForGender = (genderSymbol) => {
    switch (genderSymbol) {
        case ('m'):
            return "Pojat";
        case ('f'):
            return "Tytöt";
        case ('o'):
            return "Muunsukupuoliset";
        case ('-'):
            return "Ei halua määritellä";
        default:
            throw new Error("Tuntematon sukupuoli");
    }
}

// Similar to CheckInLogView, but displays general statistics, not names.
const CheckInStatisticsView = (props) => {
    useAutoLogout();

    const [clubName, setClubName] = useState('');
    const [data, setData] = useState([]);
    const [searchDate, setSearchDate] = useState('');
    const notify = useNotify();

    const resetState = () => {
        setClubName('');
        setData([]);
        setSearchDate('');
    }

    const getCheckInStats = async values => {
        const date = new Date(values.queryDate);
        if (!isNaN(date.getTime())) {
            const url = api.youthClub.checkInStats;
            const body = JSON.stringify({
                clubId: props.match.params.youthClubId,
                date: date
            });
            const options = {
                method: 'POST',
                body
            };
            resetState();
            await httpClientWithRefresh(url, options)
                .then(response => {
                    if (response.statistics.map(s => s.count).reduce((x,y) => x + y, 0) === 0) {
                        notify("Ei kirjautumisia valitulla aikavälillä", "warning");
                        return;
                    }
                    setSearchDate(date.toLocaleDateString());
                    setClubName(response.clubName);
                    setData(response.statistics);
                });
        }
    }

    return (
        <Container>
            <Form
                onSubmit={getCheckInStats}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <CheckInLogCard>
                            <CheckInLogCardHeader title="Valitse päivämäärä" />
                            <CheckInLogCardContentSelect>
                                <DateInput label="Päivämäärä" source="queryDate" defaultValue={new Date().toISOString().split('T')[0]} />
                                <Button type="submit">Hae</Button>
                            </CheckInLogCardContentSelect>
                        </CheckInLogCard>
                    </form>
                )}
            />
            <VerticalCardPadding />
            {clubName !== '' &&
                <CheckInLogCard>
                    <CheckInLogCardHeader title={clubName} subheader={searchDate} />
                    <CheckInLogCardContent>
                        {data.map(({ gender, count, ageRanges }) => (
                            <div key={`${gender} container`}>
                                <StyledDialogTitle>{labelForGender(gender)}</StyledDialogTitle>
                                <CheckInLogTextFieldContainer>
                                    <CheckInLogTextField
                                        key={gender}
                                        label="Yhteensä"
                                        defaultValue={count}
                                        margin="normal"
                                        variant="filled"
                                        InputProps={{ readOnly: true }}
                                    />
                                </CheckInLogTextFieldContainer>
                                <Typography variant="subtitle1">Ikäjakaumat</Typography>
                                <CheckInLogTextFieldContainer>
                                    {ageRanges.map(({ ageRange, count: countByAgeRange }) => (
                                        <CheckInLogTextField
                                            key={`${gender} ${ageRange}`}
                                            label={ageRange}
                                            defaultValue={countByAgeRange}
                                            margin="normal"
                                            variant="filled"
                                            InputProps={{ readOnly: true }}
                                        />
                                    ))}
                                </CheckInLogTextFieldContainer>
                                <hr />
                            </div>
                        ))}
                    </CheckInLogCardContent>
                </CheckInLogCard>
            }
        </Container>
    )
}

export default CheckInStatisticsView;
