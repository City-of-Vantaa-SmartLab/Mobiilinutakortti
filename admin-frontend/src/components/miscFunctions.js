import React, { useState, useCallback } from 'react';
import { Title, useNotify } from 'react-admin';
import { Redirect } from 'react-router-dom';
import { Button, Card, CardContent } from '@material-ui/core';
import { httpClient } from '../httpClients';
import { STATE } from '../state';
import api from '../api';
import useAutoLogout from '../hooks/useAutoLogout';

const MiscFunctions = () => {
  const notify = useNotify();
  const notifyError = useCallback((msg) => notify(msg, 'error'), [notify]);

  const [state, setState] = useState(STATE.INITIAL);

  useAutoLogout();

  const resetSpamGuard = async () => {
    setState(STATE.LOADING);
    const response = await httpClient(api.spamGuard.reset, {
      method: 'POST',
    });
    if (response.statusCode < 200 || response.statusCode >= 300) {
      notifyError('Virhe alustaessa spam-estoa');
      setState(STATE.INITIAL);
    } else {
      notify(`Estolistalta poistettiin ${response.message} merkintää.`, 'success');
      setState(STATE.DONE);
    }
  };

  const resetKompassiIntegration = async () => {
    setState(STATE.LOADING);
    const response = await httpClient(api.kompassi.reset, {
      method: 'POST',
    });
    if (response.statusCode < 200 || response.statusCode >= 300) {
      notifyError('Virhe tyhjentäessä Kompassi-välimuistia');
      setState(STATE.INITIAL);
    } else {
      notify('Kompassi-aktiviteettivälimuisti tyhjennetty', 'success');
      setState(STATE.DONE);
    }
  };

  if (state === STATE.DONE) {
    return <Redirect to="/" />;
  }

  const kompassiIntegration = process.env.REACT_APP_ENABLE_KOMPASSI_INTEGRATION;

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
          label="Alusta spam-estolistat"
          size="large"
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
          label="Tyhjennä Kompassi-aktiviteettivälimuisti"
          size="large"
        >
          {state === STATE.INITIAL ? 'Tyhjennä Kompassi-aktiviteettivälimuisti' : 'Odota'}
        </Button>
      </CardContent>)}
    </Card>
  );
};

export default MiscFunctions;
