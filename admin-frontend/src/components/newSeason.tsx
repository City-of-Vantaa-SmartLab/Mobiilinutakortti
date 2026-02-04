import { useState, useEffect } from 'react';
import { Title, useNotify } from 'react-admin';
import { Navigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import { TextField } from '@mui/material';
import { httpClientWithRefresh } from '../httpClients/httpClientWithRefresh';
import api from '../api';
import { STATE } from '../state';
import { Status, statusChoices } from '../utils';
import useAutoLogout from '../hooks/useAutoLogout';
import ForwardIcon from '@mui/icons-material/Forward';
import NewSeasonIcon from '@mui/icons-material/Autorenew';
import CancelIcon from '@mui/icons-material/Cancel';
import { CalendarHelper } from './calendarHelper';
import { ModalBackdrop, ModalContent, ModalButtonsContainer } from './styledComponents';

const showExtraEntries = import.meta.env.VITE_ENABLE_EXTRA_ENTRIES;

const getCurrentDate = () => new Date().toISOString().split('T')[0];

const NewSeasonModal = ({ onConfirm, onCancel, loadingState }) => {
  const [date, setDate] = useState(getCurrentDate());
  const disabled = loadingState !== STATE.INITIAL;

  return (
    <ModalBackdrop zIndex={10} paddingTop="100px">
      <ModalContent maxWidth="600px">
        <p>
          Anna päivämäärä, jona vanhentuneet käyttäjät tullaan poistamaan. Tämä
          päivämäärä ilmoitetaan huoltajille lähetettävässä tekstiviestissä.
        </p>
        <p>
          Huomaa, että järjestelmä <strong>ei poista</strong> vanhentuneita
          käyttäjiä automaattisesti annettuna päivämääränä, vaan se on tehtävä
          käsin valikon kohdasta "Poista vanhat käyttäjät".
        </p>
        <TextField
          label="Päivämäärä"
          type="date"
          disabled={disabled}
          value={date}
          onChange={(event) => setDate(event.currentTarget.value)}
          helperText={<CalendarHelper />}
          sx={{ mb: 1 }}
        ></TextField>
        <ModalButtonsContainer justifyContent="center">
          <Button
            onClick={onCancel}
            disabled={disabled}
            variant="contained"
            startIcon={<CancelIcon />}
            sx={{ mt: '1em', mr: '1em' }}
          >
            Peruuta
          </Button>
          <Button
            onClick={() => onConfirm(date)}
            disabled={disabled}
            variant="contained"
            color="primary"
            startIcon={<NewSeasonIcon />}
            sx={{ mt: '1em' }}
          >
            {disabled ? 'Odota' : 'Aloita uusi kausi'}
          </Button>
        </ModalButtonsContainer>
      </ModalContent>
    </ModalBackdrop>
  );
};

const NewSeason = () => {
  const notify = useNotify();

  const [state, setState] = useState(STATE.INITIAL);
  const [SMSCount, setSMSCount] = useState('?');
  const [modalVisible, setModalVisible] = useState(false);

  useAutoLogout();

  useEffect(() => {
      const querySMSCount = async () => {
          const response = await httpClientWithRefresh(api.junior.newSeasonSMSCount, {method: 'GET'});
          setSMSCount(response.message);
      };
      querySMSCount();
  }, []);

  const createNewSeason = async (expireDate: string) => {
    setState(STATE.LOADING);
    const response = await httpClientWithRefresh(api.junior.newSeason, {
      method: 'POST',
      body: JSON.stringify({
        expireDate,
      }),
    });
    if (response.statusCode < 200 || response.statusCode >= 300) {
      notify(response.message, { type: 'warning' });
      setState(STATE.INITIAL);
    } else {
      notify(response.message);
      setModalVisible(false);
      setState(STATE.DONE);
    }
  };

  if (state === STATE.DONE) {
    return <Navigate to="/" replace />;
  }

  return (
    <Card sx={{ marginTop: 2 }}>
      <Title title="Aloita uusi kausi"></Title>
      <CardContent>
        <p>
          Uuden kauden aloittaminen muuttaa nuorten tilaksi "{statusChoices.find(s => s.id === Status.expired).name}"
          ja lähettää kaikille huoltajille tekstiviestinä linkin kortin uusintahakemukseen.
        </p>
        {showExtraEntries && <p>
          Tämä toiminto ei vaikuta nuoriin, joiden tila on "{statusChoices.find(s => s.id === Status.extraEntriesOnly).name}".
        </p>}
        <p>
          Uuden kauden aloittaminen lähettää {SMSCount} tekstiviestiä. Niiden lähettämisestä syntyy kustannuksia.
        </p>
        <Button
          onClick={() => setModalVisible(true)}
          variant="contained"
          color="primary"
          size="large"
          startIcon={<ForwardIcon />}
        >
          Jatka
        </Button>
      </CardContent>
      {modalVisible && (
        <NewSeasonModal
          onCancel={() => setModalVisible(false)}
          onConfirm={(date: any) => createNewSeason(new Date(date).toISOString())}
          loadingState={state}
        />
      )}
    </Card>
  );
};

export default NewSeason;
