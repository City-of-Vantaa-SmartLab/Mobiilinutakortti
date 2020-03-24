import React, { useState, useEffect } from 'react';
import QrReader from 'react-qr-reader'
import ding from '../../audio/ding.mp3'
import WelcomeScreen from "./welcomeScreen";
import LoadingMessage from "../loadingMessage";
import { showNotification } from 'react-admin';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import { httpClient, httpClientWithResponse } from '../../httpClients';
import api from '../../api';
import { authProvider } from '../../providers';
import { token } from '../../utils';
import { AUTH_LOGOUT } from 'react-admin';
import CheckinBackground from './checkInBackground.js';

const Container = styled.div`
  height: 100%;
  width: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const QrReaderContainer = styled.div`
  margin-top: 5.2em;
  width: 32em;
  border: 55px solid #f9e51e;
  -webkit-box-shadow: 2px 10px 60px -19px rgba(0,0,0,0.75);
  -moz-box-shadow: 2px 10px 60px -19px rgba(0,0,0,0.75);
  box-shadow: 2px 10px 60px -19px rgba(0,0,0,0.75);
`

let audio = new Audio(ding)
const CheckInView = (props) => {
  const [showQRCode, setShowQRCode] = useState(true);
  const [showWelcomeNotification, setShowWelcomeNotification] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const handleCheckInSuccess = () => {
    setLoading(false);
    setShowQRCode(false)
    audio.play();
    setShowWelcomeNotification(true);
    setTimeout(() => {
      setShowWelcomeNotification(false);
      setShowQRCode(true);
    }, 2500);
  };

  const handleScan = async (qrData) => {
    if (qrData) {
      setShowQRCode(false);
      setLoading(true);
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
            handleCheckInSuccess();
          }
        });
    }
  };

  const handleError = () => {
    const { showNotification } = props;
    showNotification('Jokin meni pieleen! Kokeile uudestaan.', 'warning')
  };

  return (
    <Container>
      <CheckinBackground />
      {showQRCode && (
          <QrReaderContainer>
            <QrReader
                delay={10000}
                onScan={handleScan}
                onError={handleError}
                style={{ width: "100%", height: "100%", transform: `scaleX(-1)` }}
            />
          </QrReaderContainer>
      )}
      {showWelcomeNotification && (
          <WelcomeScreen />
      )}
      {loading && (
          <LoadingMessage message={'Odota hetki'}/>
      )}
    </Container>
  )
};

export default connect(null, {
  showNotification
})(CheckInView);
