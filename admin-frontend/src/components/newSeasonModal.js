import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@material-ui/core';
import { TextField } from '@material-ui/core';
import { STATE } from '../state';

const ModalContainer = styled.div`
  position: fixed;
  padding-top: 100px;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgb(0, 0, 0);
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;

  .modal-content {
    background-color: white;
    padding: 1.2em;
    margin: auto;
    min-width: 200px;
    max-width: 600px;
    flex-direction: column;

    .buttons-container {
      margin-top: 1em;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
    }

    .modal-button {
      margin-top: 1em;
      margin-right: 1em;
    }
  }
`;

const getCurrentDate = () => new Date().toISOString().split('T')[0];

const NewSeasonModal = ({ onConfirm, onCancel, loadingState }) => {
  const [date, setDate] = useState(getCurrentDate());
  const disabled = loadingState !== STATE.INITIAL;

  return (
    <ModalContainer>
      <div className="modal-content">
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
        ></TextField>
        <div className="buttons-container">
          <Button
            onClick={() => onConfirm(date)}
            disabled={disabled}
            variant="contained"
            color="primary"
            className={'modal-button'}
          >
            {disabled ? 'Odota' : 'Aloita uusi kausi'}
          </Button>
          <Button
            onClick={onCancel}
            disabled={disabled}
            variant="contained"
            className={'modal-button'}
          >
            Peruuta
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
};

export default NewSeasonModal;
