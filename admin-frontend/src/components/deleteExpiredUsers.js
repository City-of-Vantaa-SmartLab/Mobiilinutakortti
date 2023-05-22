import React, { useState, useEffect, useCallback } from 'react';
import { Title, useNotify, GET_LIST } from 'react-admin';
import { Redirect } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import CardContent from '@material-ui/core/CardContent';
import TextField from '@material-ui/core/TextField';
import { juniorProvider } from '../providers/juniorProvider';
import { httpClient } from '../httpClients';
import { STATE } from '../state';
import api from '../api';
import styled from 'styled-components';

const getExpiredUsers = () =>
  juniorProvider(
    GET_LIST,
    {
      filter: { status: 'expired' },
      pagination: { page: 1, perPage: 1 },
      sort: { field: 'id', order: 'ASC' },
    },
    httpClient,
  );

const InputContainer = styled.div`
  margin-bottom: 1rem;
`;

const DeleteExpiredUsers = () => {
  const notify = useNotify();
  const notifyError = useCallback((msg) => notify(msg, 'error'), [notify]);

  const [state, setState] = useState(STATE.INITIAL);
  const [expiredUserCount, setExpiredUserCount] = useState(0);
  const [password, setPassword] = useState('');

  useEffect(() => {
    const getExpiredUserCount = async () => {
      setState(STATE.LOADING);

      try {
        const { total } = await getExpiredUsers();
        setExpiredUserCount(total);
      } catch (error) {
        notifyError('Käyttäjien haku epäonnistui');
        setExpiredUserCount(0);
      }

      setState(STATE.INITIAL);
    };

    getExpiredUserCount();
  }, [notifyError]);

  const authenticate = async () => {
    try {
      // Get information about the currently logged in user.
      const { email } = await httpClient(api.youthWorker.self, {
        method: 'GET',
      });

      // Attempt to authenticate with the logged in user's email and
      // the provided password.
      const response = await httpClient(api.auth.login, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.statusCode < 200 || response.statusCode >= 300) {
        setState(STATE.INITIAL);
        notifyError('Virheellinen salasana');
        return false;
      }
    } catch (error) {
      setState(STATE.INITIAL);
      notifyError('Virhe käyttäjän tunnistautumisessa');
      return false;
    }

    return true;
  };

  const deleteExpiredUsers = async () => {
    const response = await httpClient(api.junior.deleteExpiredUsers, {
      method: 'DELETE',
    });
    if (response.statusCode < 200 || response.statusCode >= 300) {
      notifyError('Virhe poistettaessa käyttäjiä');
      setState(STATE.INITIAL);
    } else {
      notify('Vanhentuneet käyttäjät poistettu', 'success');
      setState(STATE.DONE);
    }
  };

  const handleClick = async () => {
    setState(STATE.LOADING);
    (await authenticate()) && deleteExpiredUsers();
  };

  if (state === STATE.DONE) {
    return <Redirect to="/" />;
  }

  return (
    <Card>
      <Title title="Poista vanhat käyttäjät"></Title>
      <CardContent>
        <p>
          Vanhojen käyttäjien poistaminen poistaa järjestelmästä kaikki
          käyttäjätiedot nuorilta, joiden tila on "Tunnus vanhentunut". Näitä
          käyttäjiä on yhteensä {expiredUserCount}.
        </p>
        <p>Kirjoita salasanasi, jos haluat jatkaa.</p>
        <InputContainer>
          <TextField
            label="Salasana"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </InputContainer>
        <Button
          onClick={handleClick}
          variant="contained"
          disabled={state !== STATE.INITIAL || !password || !expiredUserCount}
          color="primary"
          label="Kyllä"
          size="large"
        >
          {state === STATE.INITIAL ? 'Poista vanhat käyttäjät' : 'Odota'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DeleteExpiredUsers;
