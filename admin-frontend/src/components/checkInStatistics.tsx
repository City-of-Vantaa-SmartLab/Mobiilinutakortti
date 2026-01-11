import { useState } from 'react';
import { useNotify } from 'react-admin';
import { useParams } from 'react-router-dom';
import { Form } from 'react-final-form';
import { Button, Divider } from '@mui/material';
import {
    Container,
    CheckInLogCard,
    CheckInLogCardHeader,
    CheckInLogCardContent,
    CheckInLogTextField,
    CheckInLogTextFieldContainer,
    CheckInLogCardContentSelect,
    VerticalCardPadding,
    StyledDialogTitle,
    QueryDatePickerField
} from './styledComponents';
import { Typography } from '@mui/material';
import { httpClientWithRefresh } from '../httpClients/httpClientWithRefresh';
import api from '../api';
import useAutoLogout from '../hooks/useAutoLogout';

const labelForGender = (genderSymbol: string): string => {
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

interface CheckInStatsViewModel {
  clubName: string;
  statistics: CheckInStatistics[];
}

interface CheckInStatistics {
  gender: string;
  count: number;
  ageRanges: {
    ageRange: string;
    count: number;
  }[];
}

// Similar to CheckInLogView, but displays general statistics, not names.
const CheckInStatisticsView = () => {
    useAutoLogout();
    const { youthClubId } = useParams<{ youthClubId: string }>();

    const [clubName, setClubName] = useState('');
    const [data, setData] = useState([]);
    const [searchDate, setSearchDate] = useState('');
    const notify = useNotify();

    const resetState = () => {
        setClubName('');
        setData([]);
        setSearchDate('');
    }

    const getCheckInStats = async (data: { queryDate: string }) => {
        const date = new Date(data.queryDate);
        if (!isNaN(date.getTime())) {
            const url = api.youthClub.checkInStats;
            const body = JSON.stringify({
                targetId: youthClubId,
                date: date
            });
            const options = {
                method: 'POST',
                body
            };
            resetState();
            await httpClientWithRefresh(url, options)
                .then((response: CheckInStatsViewModel) => {
                    if (response.statistics.map((s: CheckInStatistics) => s.count).reduce((x,y) => x + y, 0) === 0) {
                        notify("Ei kirjautumisia valitulla aikavälillä", { type: 'warning' });
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
                                <QueryDatePickerField />
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
                                        slotProps={{ input: { readOnly: true } }}
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
                                            slotProps={{ input: { readOnly: true } }}
                                        />
                                    ))}
                                </CheckInLogTextFieldContainer>
                                <Divider sx={{ width: '100%', my: 3, borderColor: '#808080' }} />
                            </div>
                        ))}
                    </CheckInLogCardContent>
                </CheckInLogCard>
            }
        </Container>
    )
}

export default CheckInStatisticsView;
