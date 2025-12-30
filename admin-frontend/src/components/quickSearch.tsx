import { useState } from 'react';
import { Title, useNotify } from 'react-admin';
import { Button, Card, CardContent, TextField, Table, TableBody, TableCell, TableHead, TableRow, Box, InputAdornment } from '@mui/material';
import { httpClientWithRefresh } from '../httpClients/httpClientWithRefresh';
import api from '../api';
import useAutoLogout from '../hooks/useAutoLogout';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { juniorProvider } from '../providers/juniorProvider';
import { Status } from '../utils';

interface Junior {
  id: string;
  displayName: string;
  phoneNumber: string;
  status: string;
}

// The quick search is meant to help use with mobile phone.
// To do the most common simple tasks in youth clubs without anything unnecessary going on.
const QuickSearch = () => {
  const notify = useNotify();
  const [phoneSearch, setPhoneSearch] = useState('');
  const [nameSearch, setNameSearch] = useState('');
  const [results, setResults] = useState<Junior[]>([]);
  const [searching, setSearching] = useState(false);

  useAutoLogout();

  const handleSearch = async () => {
    if (!phoneSearch.trim() && !nameSearch.trim()) {
      notify('Anna ainakin yksi hakuehto', { type: 'warning' });
      return;
    }

    setSearching(true);
    try {
      const response = await juniorProvider.getList({
        filter: {
          phoneNumber: phoneSearch.trim() || undefined,
          name: nameSearch.trim() || undefined,
        },
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'firstName', order: 'ASC' },
      });

      setResults(response.data || []);
      if (response.data?.length === 0) {
        notify('Ei hakutuloksia', { type: 'info' });
      }
    } catch (error) {
      notify('Virhe haettaessa nuoria', { type: 'error' });
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  const handleClear = () => {
    setPhoneSearch('');
    setNameSearch('');
    setResults([]);
  };

  const sendSMS = async (phoneNumber: string) => {
    const url = api.junior.loginLink;
    const body = JSON.stringify({ phoneNumber });
    const options = { method: 'POST', body };

    try {
      const response = await httpClientWithRefresh(url, options);
      if (response.statusCode < 200 || response.statusCode >= 300) {
        notify(response.message, { type: 'warning' });
      } else {
        notify(response.message);
      }
    } catch (error) {
      notify('Virhe lähetettäessä tekstiviestiä', { type: 'error' });
    }
  };

  return (
    <Card>
      <Title title="Pikahaku"></Title>
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 600 }}>
          <TextField
            label="Nimi, kutsumanimi tai sukunimi"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            fullWidth
          />

          <TextField
            label="Puhelinnumero"
            value={phoneSearch}
            onChange={(e) => setPhoneSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start" sx={{ color: 'text.disabled' }}>
                    +358…
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              disabled={searching}
            >
              {searching ? 'Haetaan...' : 'Hae'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClear}
              disabled={searching}
            >
              Tyhjennä
            </Button>
          </Box>

          {results.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Nimi</strong></TableCell>
                    <TableCell><strong>Puhelinnumero</strong></TableCell>
                    <TableCell align="center"><strong>Tiedot</strong></TableCell>
                    <TableCell align="center"><strong>Lähetä SMS</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((junior) => (
                    <TableRow key={junior.id}>
                      <TableCell>{junior.displayName}</TableCell>
                      <TableCell>{junior.phoneNumber}</TableCell>
                      <TableCell align="center">
                        <a href={`#/junior/${junior.id}`} style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                          Näytä
                        </a>
                      </TableCell>
                      <TableCell align="center">
                        {(junior.status === Status.accepted || junior.status === Status.expired)
                          ? <Button
                            size="small"
                            variant="contained"
                            onClick={() => sendSMS(junior.phoneNumber)}
                          >
                          📨 SMS
                        </Button>
                        : <Button size="small" disabled style={{ padding: 0 }}>Kotisoitto tekemättä</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuickSearch;
