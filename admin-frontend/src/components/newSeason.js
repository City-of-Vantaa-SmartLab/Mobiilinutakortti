import React, { useState, useEffect } from 'react';
import { Title, useNotify } from 'react-admin';
import { Redirect } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import CardContent from '@material-ui/core/CardContent';
import { httpClientWithRefresh } from '../httpClients';
import api from '../api';
import { STATE } from '../state';
import NewSeasonModal from './newSeasonModal';
import { Status, statusChoices } from '../utils';
import useAutoLogout from '../hooks/useAutoLogout';

const showExtraEntries = process.env.REACT_APP_ENABLE_EXTRA_ENTRIES;

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

  const createNewSeason = async (expireDate) => {
    setState(STATE.LOADING);
    const response = await httpClientWithRefresh(api.junior.newSeason, {
      method: 'POST',
      body: JSON.stringify({
        expireDate,
      }),
    });
    if (response.statusCode < 200 || response.statusCode >= 300) {
      notify(response.message, 'warning');
      setState(STATE.INITIAL);
    } else {
      notify(response.message);
      setModalVisible(false);
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
          Uuden kauden aloittaminen muuttaa nuorten tilaksi
          "{statusChoices.find(s => s.id === Status.expired).name}" ja lähettää kaikille huoltajille tekstiviestinä
          linkin kortin uusintahakemukseen. Jos käyttäjiä on esimerkiksi yli 2000,
          maksaa tekstiviestien lähettäminen jo yli 80 euroa.
        </p>
        {showExtraEntries && <p>
          Tämä toiminto ei vaikuta nuoriin, joiden tila on "{statusChoices.find(s => s.id === Status.extraEntriesOnly).name}".
        </p>}
        <p>
          Järjestelmä tulee lähettämään {SMSCount} tekstiviestiä.
        </p>
        <p>Oletko varma, että haluat jatkaa?</p>
        <Button
          onClick={() => setModalVisible(true)}
          variant="contained"
          color="primary"
          size="large"
        >
          Kyllä
        </Button>
      </CardContent>
      {modalVisible && (
        <NewSeasonModal
          onCancel={() => setModalVisible(false)}
          onConfirm={(date) => createNewSeason(new Date(date).toISOString())}
          loadingState={state}
        />
      )}
    </Card>
  );
};

export default NewSeason;
