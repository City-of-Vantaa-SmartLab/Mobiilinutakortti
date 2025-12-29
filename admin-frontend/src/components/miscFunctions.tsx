import { useState } from 'react';
import { Title, useNotify } from 'react-admin';
import { Navigate } from 'react-router-dom';
import { Button, Card, CardContent } from '@mui/material';
import { httpClient } from '../httpClients/httpClient';
import { STATE } from '../state';
import api from '../api';
import useAutoLogout from '../hooks/useAutoLogout';
import ResetIcon from '@mui/icons-material/Autorenew';
import EmptyIcon from '@mui/icons-material/Cached';

const MiscFunctions = () => {
  const notify = useNotify();

  const [state, setState] = useState(STATE.INITIAL);

  useAutoLogout();

  const resetSpamGuard = async () => {
    setState(STATE.LOADING);
    const response = await httpClient(api.spamGuard.reset, {
      method: 'POST',
    });
    if (response.statusCode < 200 || response.statusCode >= 300) {
      notify('Virhe alustaessa spam-estoa', { type: 'error' });
      setState(STATE.INITIAL);
    } else {
      notify(`Estolistalta poistettiin ${response.message} merkintää.`, { type: 'success' });
      setState(STATE.DONE);
    }
  };

  const resetKompassiIntegration = async () => {
    setState(STATE.LOADING);
    const response = await httpClient(api.kompassi.reset, {
      method: 'POST',
    });
    if (response.statusCode < 200 || response.statusCode >= 300) {
      notify('Virhe tyhjentäessä Kompassi-välimuistia', { type: 'error' });
      setState(STATE.INITIAL);
    } else {
      notify('Kompassi-välimuisti tyhjennetty', { type: 'success' });
      setState(STATE.DONE);
    }
  };

  if (state === STATE.DONE) {
    return <Navigate to="/" replace />;
  }

  const kompassiIntegration = import.meta.env.VITE_ENABLE_KOMPASSI_INTEGRATION;

  return (
    <Card>
      <Title title="Muut toiminnot"></Title>
      <CardContent>
        <p>Spam-estotoiminto estää nuoria kirjautumasta nuorisotiloille tai tilaamasta kirjautumistekstiviestilinkkejä liian tiheään. Toiminnolla ylläpidetään palvelun saavutettavuutta ja turvallisuutta.</p>
        <p>Tällä toiminnolla voit alustaa spam-estotoiminnon oletustilaansa, mikäli siitä on aiheutunut jollekin nuorelle ongelmia. Alustus tapahtuu normaalisti automaattisesti joka yö.</p>
        <Button
          onClick={resetSpamGuard}
          variant="contained"
          disabled={state !== STATE.INITIAL}
          color="primary"
          size="large"
          startIcon={<ResetIcon />}
        >
          {state === STATE.INITIAL ? 'Alusta spam-estolistat' : 'Odota'}
        </Button>
      </CardContent>
      {kompassiIntegration && (<CardContent>
        <p>Tällä toiminnolla voit pakottaa Nutakortin lukemaan aktiviteetit Kompassista uudelleen muistiin. Jos Kompassi-aktiviteetti on poistettu sen jälkeen kun Nutakortti on jo käyttänyt sitä, voit tällä pakottaa Nutakortin luomaan uuden aktiviteetin.</p>
        <Button
          onClick={resetKompassiIntegration}
          variant="contained"
          disabled={state !== STATE.INITIAL}
          color="primary"
          size="large"
          startIcon={<EmptyIcon />}
        >
          {state === STATE.INITIAL ? 'Tyhjennä Kompassi-välimuisti' : 'Odota'}
        </Button>
      </CardContent>)}
    </Card>
  );
};

export default MiscFunctions;
