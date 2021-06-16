import React, { useState } from 'react';
import { Title, useNotify } from 'react-admin';
import { Redirect } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import CardContent from '@material-ui/core/CardContent';
import { httpClientWithResponse } from '../httpClients';
import api from '../api';

const STATE = {
  INITIAL: 'initial',
  LOADING: 'loading',
  DONE: 'done',
};

const NewSeason = () => {
  const notify = useNotify();

  const [state, setState] = useState(STATE.INITIAL);
  const disabled = [STATE.LOADING, STATE.DONE].includes(state);
  const label = state === STATE.INITIAL ? 'Kyllä' : 'Odota';

  const createNewSeason = async () => {
    setState(STATE.LOADING);
    const response = await httpClientWithResponse(api.junior.newSeason, {
      method: 'POST',
    });
    if (response.statusCode < 200 || response.statusCode >= 300) {
      notify(response.message, 'warning');
      setState(STATE.INITIAL);
    } else {
      notify(response.message);
      setState(STATE.DONE);
    }
  };

  if (state === STATE.DONE) {
    return <Redirect to="/" />;
  }

  return (
    <Card>
      <Title title="Aloita uusi kausi"></Title>
      <CardContent>
        <p>
          Uuden kauden aloittaminen muuttaa nykyisten käyttäjien tilan tilaan
          "tunnus vanhentunut" ja lähettää kaikille huoltajille tekstiviestinä
          linkin kortin uusintahakemukseen. Käyttäjiä on yli 2000 ja
          tekstiviestin lähettäminen maksaa yli 80 euroa.
        </p>
        <p>Oletko varma, että haluat jatkaa?</p>
        <Button
          onClick={createNewSeason}
          variant="contained"
          disabled={disabled}
          color="primary"
          label="Kyllä"
          size="large"
        >
          {label}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NewSeason;
