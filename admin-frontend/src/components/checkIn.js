import React, { useEffect } from 'react';
import QrReader from 'react-qr-reader'
import { showNotification } from 'react-admin';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import { httpClient, httpClientWithResponse } from '../httpClients';
import api from '../api';
import { authProvider } from '../providers';
import { token } from '../utils';
import { AUTH_LOGOUT } from 'react-admin';

const Container = styled.div`
  height: 100%;
  width: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`

const CheckInView = (props) => {

  useEffect(() => {
    let refresh = setInterval(async () => {
      await httpClient(api.youthWorker.refresh, { method: 'GET' }).then(async (response) => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          clearInterval(refresh);
          await authProvider(AUTH_LOGOUT, {});
          window.location.reload();
        }
        return response;
      })
        .then(({ access_token }) => {
          localStorage.setItem(token, access_token);
        })
    }, 1 * 60000);

    return () => {
      clearInterval(refresh);
      refresh = null;
    }
  }, []);

  const handleScan = async (qrData) => {
    if (qrData) {
      const url = api.youthClub.checkIn;
      const body = JSON.stringify({
        clubId: props.match.params.youthClubId,
        juniorId: qrData
      });
      const options = {
        method: 'POST',
        body
      };
      await httpClientWithResponse(url, options)
        .then(response => {
          const { showNotification } = props;
          if (response.statusCode < 200 || response.statusCode >= 300) {
            showNotification('Jokin meni pieleen! Kokeile uudestaan.', 'warning')
          } else {
            showNotification('Kirjautuminen onnistui!')
          }
        });
    }
  };

  const handleError = () => {
    const { showNotification } = props;
    showNotification('Jokin meni pieleen! Kokeile uudestaan.', 'warning')
  }

  return (
    <Container>
      <QrReader
        delay={5000}
        onScan={handleScan}
        onError={handleError}
        style={{ width: 640, height: 640 }}
      />
      <Button variant="contained" href="#youthclub" >Takaisin</Button>
    </Container>
  )
}

export default connect(null, {
  showNotification
})(CheckInView);
