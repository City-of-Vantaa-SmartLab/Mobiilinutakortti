import { useState } from 'react';
import { Button, Paper } from '@mui/material';
import { TextField } from '@mui/material';
import { STATE } from '../state';
import NewSeasonIcon from '@mui/icons-material/Autorenew';
import CancelIcon from '@mui/icons-material/Cancel';
import { CalendarHelper } from './calendarHelper';
import { Box } from '@mui/material';

const ModalBackdrop = ({ children }) => (
  <Box
    sx={{
      position: 'fixed',
      paddingTop: '100px',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 10,
    }}
  >
    {children}
  </Box>
);

const ModalContent = ({ children }) => (
  <Paper
    sx={{
      padding: '1.2em',
      margin: 'auto',
      minWidth: '200px',
      maxWidth: '600px',
      flexDirection: 'column',
    }}
  >
    {children}
  </Paper>
);

const ButtonsContainer = ({ children }) => (
  <Box
    sx={{
      marginTop: '1em',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      '& > button': {
        marginTop: '1em',
        marginRight: '1em',
      }
    }}
  >
    {children}
  </Box>
);

const getCurrentDate = () => new Date().toISOString().split('T')[0];

const NewSeasonModal = ({ onConfirm, onCancel, loadingState }) => {
  const [date, setDate] = useState(getCurrentDate());
  const disabled = loadingState !== STATE.INITIAL;

  return (
    <ModalBackdrop>
      <ModalContent>
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
        <ButtonsContainer>
          <Button
            onClick={() => onConfirm(date)}
            disabled={disabled}
            variant="contained"
            color="primary"
            startIcon={<NewSeasonIcon />}
          >
            {disabled ? 'Odota' : 'Aloita uusi kausi'}
          </Button>
          <Button
            onClick={onCancel}
            disabled={disabled}
            variant="contained"
            startIcon={<CancelIcon />}
          >
            Peruuta
          </Button>
        </ButtonsContainer>
      </ModalContent>
    </ModalBackdrop>
  );
};

export default NewSeasonModal;
