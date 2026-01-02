import { useState, useEffect } from 'react';
import { useNotify } from 'react-admin';
import { useParams } from 'react-router-dom';
import {
    Table, TableHead,
    TableRow, TableCell, TableBody,
    Link
} from '@mui/material';
import {
    Container,
    CheckInLogCard,
    CheckInLogCardHeader,
    CheckInLogCardContent
} from './checkInStyledComponents';
import { httpClientWithRefresh } from '../httpClients/httpClientWithRefresh';
import api from '../api';
import useAutoLogout from '../hooks/useAutoLogout';
import { hrefFragmentToJunior } from '../utils';

interface EventCheckInLogViewModel {
    targetName: string;
    juniors: JuniorInformation[];
}

interface JuniorInformation {
    id: string;
    name: string;
    time: string;
}

// Lists the names of people who have checked into an event.
const EventCheckInLogView = () => {
    useAutoLogout();
    const { eventId } = useParams<{ eventId: string }>();

    const [eventName, setEventName] = useState('');
    const [tableRowData, setTableRowData] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const notify = useNotify();

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

    const getCheckIns = async () => {
        const url = `${api.event.checkInLog}/${eventId}`;
        const options = {
            method: 'GET'
        };
        await httpClientWithRefresh(url, options)
            .then((response: EventCheckInLogViewModel) => {
                if (!response || !response.juniors) {
                    notify("Virhe tietojen haussa", { type: 'error' });
                    setLoaded(true);
                    return;
                }
                setEventName(response.targetName || 'Tapahtuma');
                setLoaded(true);
                if (response.juniors.length === 0) {
                    notify("Ei ilmoittautuneita", { type: 'warning' });
                    return;
                }
                populateTableRowData(response.juniors);
            })
            .catch((error) => {
                console.error('Error fetching check-ins:', error);
                notify("Virhe ilmoittautumisten haussa", { type: 'error' });
                setLoaded(true);
            });
    }

    useEffect(() => {
        getCheckIns();
    }, [eventId]);

    return (
        <Container>
            {loaded &&
                <CheckInLogCard>
                    <CheckInLogCardHeader title={eventName} subheader="Ilmoittautuneet" />
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
        </Container>
    )
}

export default EventCheckInLogView;
