import { useState } from 'react';
import { useNotify, useRedirect } from 'react-admin';
import { useParams } from 'react-router-dom';
import { Form } from 'react-final-form';
import {
    Button, Table, TableHead,
    TableRow, TableCell, TableBody,
    Link
} from '@mui/material';
import {
    Container,
    CheckInLogCard,
    CheckInLogCardHeader,
    CheckInLogCardContent,
    CheckInLogCardContentSelect,
    VerticalCardPadding,
    QueryDatePickerField,
    ReturnButton
} from './styledComponents';
import { httpClientWithRefresh } from '../httpClients/httpClientWithRefresh';
import api from '../api';
import useAutoLogout from '../hooks/useAutoLogout';
import { hrefFragmentToJunior, throwIfErrorResponse } from '../utils';

interface CheckInLogViewModel {
    targetName: string;
    juniors: JuniorInformation[];
}

interface JuniorInformation {
    id: string;
    name: string;
    time: string;
}

// "Kirjautumiset"
// Similar to statistics, but displays the names of people who have checked in.
// This is why this data is also cleared after a certain time (so as not to keep a personal information register);
// see "cron" from club service in backend.
const CheckInLogView = () => {
    useAutoLogout();
    const redirect = useRedirect();
    const { youthClubId } = useParams<{ youthClubId: string }>();

    const [clubName, setClubName] = useState('');
    const [tableRowData, setTableRowData] = useState([]);
    const [searchDate, setSearchDate] = useState('');
    const notify = useNotify();

    const resetState = () => {
        setClubName('');
        setSearchDate('');
        setTableRowData([]);
    }

    const populateTableRowData = (juniors: JuniorInformation[]) => {
        const rowData = [];
        let key = 0;
        juniors.forEach(junior => {
            rowData.push(
                <TableRow key={key}>
                    <TableCell>
                        <Link href={hrefFragmentToJunior(junior.id)} color="inherit">
                            {junior.name}
                        </Link>
                    </TableCell>
                    <TableCell>{junior.time}</TableCell>
                </TableRow >
            )
            key++;
        });
        setTableRowData(rowData);
    }

    const getCheckIns = async (data: { queryDate: string }) => {
        const date = new Date(data.queryDate);
        if (!isNaN(date.getTime())) {
            const url = api.youthClub.checkInLog;
            const body = JSON.stringify({
                targetId: youthClubId,
                date: date
            });
            const options = {
                method: 'POST',
                body
            };
            resetState();
            try {
                const response = await httpClientWithRefresh(url, options);
                throwIfErrorResponse(response);

                if (!response || !Array.isArray(response.juniors) || typeof response.targetName !== 'string') {
                    notify('Virhe tietojen haussa', { type: 'error' });
                    return;
                }

                const viewModel: CheckInLogViewModel = response;
                if (viewModel.juniors.length === 0) {
                    notify('Ei kirjautumisia valitulla aikavälillä', { type: 'warning' });
                    return;
                }

                setSearchDate(date.toLocaleDateString());
                setClubName(viewModel.targetName);
                populateTableRowData(viewModel.juniors);
            } catch (error: any) {
                notify(error?.message || 'Virhe kirjautumisten haussa', { type: 'error' });
            }
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
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nimi</TableCell>
                                    <TableCell>Aika</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tableRowData}
                            </TableBody>
                        </Table>
                    </CheckInLogCardContent>
                </CheckInLogCard>
            }
            <VerticalCardPadding />
            <ReturnButton onClick={() => redirect("/youthClub")} />
            <VerticalCardPadding />
        </Container>
    )
}

export default CheckInLogView;
