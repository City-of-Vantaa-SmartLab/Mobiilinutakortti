import React, { useState } from 'react';
import { DateInput, useNotify } from 'react-admin';
import { Form } from 'react-final-form';
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
import { httpClientWithRefresh } from '../httpClients';
import api from '../api';

// Alternative labels for mapping the genders 1-to-1 to LogBook 
const genderLabel = {
    m: 'Poika',
    f: 'Tyttö',
    o: 'Ei binäärinen',
};
  
let LogBookView = (props) => {
    const [clubName, setClubName] = useState('');
    const [data, setData] = useState([]);
    const [searchDate, setSearchDate] = useState('');
    const notify = useNotify();

    const resetState = () => {
        setClubName('');
        setData([]);
        setSearchDate('');
    }
    
    const getLogBookEntry = async values => {
        const date = new Date(values.queryDate);
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
            await httpClientWithRefresh(url, options)
                .then(response => {
                    if (response.statusCode < 200 || response.statusCode >= 300) {
                        notify(response.message, "warning");
                    } else {
                        setSearchDate(date.toLocaleDateString());
                        setClubName(response.clubName);
                        setData(response.statistics);
                    }
                });
        }
    }

    return (
        <Container>
            <Form 
                onSubmit={getLogBookEntry}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <LogBookCard>
                            <LogBookCardHeader title="Valitse Päivämäärä" />
                            <LogBookCardContentSelect>
                                <DateInput label="Päivämäärä" source="queryDate" />
                                <Button type="submit">Hae</Button>
                            </LogBookCardContentSelect>
                        </LogBookCard>
                    </form>
                )}
            />
            <VerticalCardPadding />
            {clubName !== '' &&
                <LogBookCard>
                    <LogBookCardHeader title={clubName} subheader={searchDate} />
                    <LogBookCardContent>
                        {data.map(({ gender, count, ageRanges }) => (
                            <div key={`${gender} container`}>
                                <StyledDialogTitle>Sukupuoli</StyledDialogTitle>
                                <LogBookTextFieldContainer>
                                    <LogBookTextField
                                        key={gender}
                                        label={genderLabel[gender]}
                                        defaultValue={count}
                                        margin="normal"
                                        variant="filled"
                                        InputProps={{ readOnly: true }}
                                    />
                                </LogBookTextFieldContainer>
                                <StyledDialogTitle>Ikä</StyledDialogTitle>
                                <LogBookTextFieldContainer>
                                    {ageRanges.map(({ ageRange, count: countByAgeRange }) => (
                                        <LogBookTextField
                                            key={`${gender} ${ageRange}`}
                                            label={ageRange}
                                            defaultValue={countByAgeRange}
                                            margin="normal"
                                            variant="filled"
                                            InputProps={{ readOnly: true }}
                                        />
                                    ))}
                                </LogBookTextFieldContainer>
                            </div>
                        ))}
                    </LogBookCardContent>
                </LogBookCard>
            }
        </Container>
    )
}

export default LogBookView;
