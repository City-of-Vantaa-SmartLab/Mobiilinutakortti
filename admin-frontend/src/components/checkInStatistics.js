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
import { httpClientWithRefresh } from '../httpClients';
import api from '../api';

// Alternative labels for mapping the genders similarly to 3rd party statistics applications.
const genderLabel = {
    m: 'Poika',
    f: 'Tyttö',
    o: 'Ei binäärinen',
};

// Similar to CheckInLogView, but displays general statistics, not names.
const CheckInStatisticsView = (props) => {
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
                                <DateInput label="Päivämäärä" source="queryDate" />
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
                                <StyledDialogTitle>Sukupuoli</StyledDialogTitle>
                                <CheckInLogTextFieldContainer>
                                    <CheckInLogTextField
                                        key={gender}
                                        label={genderLabel[gender]}
                                        defaultValue={count}
                                        margin="normal"
                                        variant="filled"
                                        InputProps={{ readOnly: true }}
                                    />
                                </CheckInLogTextFieldContainer>
                                <StyledDialogTitle>Ikä</StyledDialogTitle>
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
                            </div>
                        ))}
                    </CheckInLogCardContent>
                </CheckInLogCard>
            }
        </Container>
    )
}

export default CheckInStatisticsView;
