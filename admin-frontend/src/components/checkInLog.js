import React, { useState } from 'react';
import { DateInput, useNotify } from 'react-admin';
import { Form } from 'react-final-form';
import {
    Button, Table, TableHead,
    TableRow, TableCell, TableBody,
    Link
} from '@material-ui/core';
import {
    Container,
    CheckInLogCard,
    CheckInLogCardHeader,
    CheckInLogCardContent,
    CheckInLogCardContentSelect,
    VerticalCardPadding,
} from './styledComponents/checkInLog';
import { httpClientWithRefresh } from '../httpClients';
import api from '../api';

// "Kirjautumiset"
// Similar to statistics, but displays the names of people who have checked in.
// This is why this data is also cleared after a certain time; see "cron" from club service in backend.
const CheckInLogView = (props) => {
    const [clubName, setClubName] = useState('');
    const [table, setTable] = useState([]);
    const [searchDate, setSearchDate] = useState('');
    const notify = useNotify();

    const resetState = () => {
        setClubName('');
        setSearchDate('');
        setTable([]);
    }

    const mapJuniorsToUI = (juniorArray) => {
        const UI = [];
        let key = 0;
        juniorArray.forEach(junior => {
            UI.push(
                <TableRow key={key}>
                    <TableCell>
                        <Link href={`#/junior/${junior.id}`} color="inherit">
                            {junior.name}
                        </Link>
                    </TableCell>
                    <TableCell>{junior.time}</TableCell>
                </TableRow >
            )
            key++;
        });
        return UI;
    }

    const getCheckIns = async values => {
        const date = new Date(values.queryDate);
        if (!isNaN(date.getTime())) {
            const url = api.youthClub.checkInLog;
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
                    if (response.juniors.length === 0) {
                        notify("Ei kirjautumisia valitulla aikavälillä", "warning");
                        return;
                    }
                    setSearchDate(date.toLocaleDateString());
                    setClubName(response.clubName);
                    setTable(mapJuniorsToUI(response.juniors))
                });
        }
    }

    return (
        <Container>
            <Form
                onSubmit={getCheckIns}
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
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nimi</TableCell>
                                    <TableCell>Aika</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {table}
                            </TableBody>
                        </Table>
                    </CheckInLogCardContent>
                </CheckInLogCard>
            }
        </Container>
    )
}

export default CheckInLogView;
