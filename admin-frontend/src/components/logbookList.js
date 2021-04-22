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
    LogBookCard,
    LogBookCardHeader,
    LogBookCardContent,
    LogBookCardContentSelect,
    VerticalCardPadding,
} from './styledComponents/logbook';
import { httpClientWithResponse } from '../httpClients';
import api from '../api';

let LogBookListView = (props) => {
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
            const url = api.youthClub.checkIns;
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
                        notify(response.message, "warning");
                    } else {
                        setSearchDate(date.toLocaleDateString());
                        setClubName(response.clubName);
                        setTable(mapJuniorsToUI(response.juniors))
                    }
                });
        }
    }

    return (
        <Container>
            <Form
                onSubmit={getCheckIns}
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
                    </LogBookCardContent>
                </LogBookCard>
            }
        </Container>
    )
}

export default LogBookListView;
