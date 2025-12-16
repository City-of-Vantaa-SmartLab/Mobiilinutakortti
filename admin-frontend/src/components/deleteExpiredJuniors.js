import React, { useState, useEffect, useCallback } from 'react';
import { Title, useNotify, GET_LIST } from 'react-admin';
import { Redirect } from 'react-router-dom';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import { Button, Card, CardContent, Checkbox, FormControlLabel } from '@material-ui/core';
import { juniorProvider } from '../providers/juniorProvider';
import { httpClient } from '../httpClients';
import { STATE } from '../state';
import api from '../api';
import { Status, statusChoices } from '../utils';
import useAutoLogout from '../hooks/useAutoLogout';

const getExpiredJuniors = () =>
  juniorProvider(
    GET_LIST,
    {
      filter: { status: Status.expired },
      pagination: { page: 1, perPage: 1 },
      sort: { field: 'id', order: 'ASC' },
    },
    httpClient,
  );

const showExtraEntries = process.env.REACT_APP_ENABLE_EXTRA_ENTRIES;

const DeleteExpiredJuniors = () => {
  const notify = useNotify();
  const notifyError = useCallback((msg) => notify(msg, 'error'), [notify]);

  const [state, setState] = useState(STATE.INITIAL);
  const [expiredUserCount, setExpiredUserCount] = useState(0);
  const [checkboxState, setCheckboxState] = useState(false);

  const onCheckboxChange = (event) => {
    setCheckboxState(!!event.target.checked);
  };

  useAutoLogout();

  useEffect(() => {
    const getExpiredUserCount = async () => {
      setState(STATE.LOADING);

      try {
        const { total } = await getExpiredJuniors();
        setExpiredUserCount(total);
      } catch (error) {
        notifyError('Käyttäjien haku epäonnistui');
        setExpiredUserCount(0);
      }

      setState(STATE.INITIAL);
    };

    getExpiredUserCount();
  }, [notifyError]);

  const deleteExpiredJuniors = async () => {
    const response = await httpClient(api.junior.deleteExpired, {
      method: 'DELETE',
    });
    if (response.statusCode < 200 || response.statusCode >= 300) {
      notifyError('Virhe poistettaessa käyttäjiä');
      setState(STATE.INITIAL);
    } else {
      notify(response.message, 'success');
      setState(STATE.DONE);
    }
  };

  const handleClick = async () => {
    setState(STATE.LOADING);
    deleteExpiredJuniors();
  };

  if (state === STATE.DONE) {
    return <Redirect to="/" />;
  }

  return (
    <Card>
      <Title title="Poista vanhat käyttäjät"></Title>
      <CardContent>
        <p>
          Tämä toiminto poistaa järjestelmästä nuoret, joiden tila on "{statusChoices.find(s => s.id === Status.expired).name}".
        </p>
        {showExtraEntries && <p>
          Mikäli poistettavalla nuorella on lisämerkintöjä häntä ei poisteta, mutta tilakseen muutetaan "{statusChoices.find(s => s.id === Status.extraEntriesOnly).name}". Viimeisten lisämerkintöjensä vanhentuessa nuoret poistetaan järjestelmästä automaattisesti vuorokauden sisällä.
        </p>}
        <p>
          Toiminto vaikuttaa {expiredUserCount} nuoreen.
        </p>
        <FormControlLabel label="Ymmärrän yllä esitetyn tekstin sisällön ja haluan poistaa toimintoa koskevat nuoret." control={<Checkbox onChange={(event) => onCheckboxChange(event)} color="primary"/>}/>

        <Button
          onClick={handleClick}
          variant="contained"
          disabled={state !== STATE.INITIAL || !checkboxState}
          color="primary"
          startIcon={<DeleteIcon />}
          label="Poista vanhat käyttäjät"
          size="large"
        >
          {state === STATE.INITIAL ? 'Suorita poisto' : 'Odota'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DeleteExpiredJuniors;
