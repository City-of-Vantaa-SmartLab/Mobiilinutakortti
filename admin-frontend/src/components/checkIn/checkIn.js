import React, { useState, useEffect } from 'react';
import { Notification } from 'react-admin';
import NavigationPrompt from "react-router-navigation-prompt";
import ConfirmNavigationModal from "../ConfirmNavigationModal";
import QrReader from 'react-qr-reader';
import QrCheckResultScreen from "./qrCheckResultScreen.js";
import LoadingMessage from "../loadingMessage";
import { useNotify } from 'react-admin';
import styled from 'styled-components';
import { httpClient } from '../../httpClients';
import api from '../../api';
import CheckinBackground from './checkInBackground.js';
import { successSound, errorSound } from "../../audio/audio.js"
import { checkInClubId, userToken } from '../../utils';

const Container = styled.div`
  height: 100%;
  width: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const QrReaderContainer = styled.div`
  margin-top: 7.4em;
  width: 32em;
  max-width: 100%;
  border: 55px solid #f9e51e;
  -webkit-box-shadow: 2px 10px 60px -19px rgba(0,0,0,0.75);
  -moz-box-shadow: 2px 10px 60px -19px rgba(0,0,0,0.75);
  box-shadow: 2px 10px 60px -19px rgba(0,0,0,0.75);
`

const CheckInView = (props) => {
  const [showQRCode, setShowQRCode] = useState(true);
  const [showQrCheckNotification, setShowQrCheckNotification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(null);
  const notify = useNotify();

  const logout = () => {
    sessionStorage.removeItem(checkInClubId)
    if (process.env.REACT_APP_ADMIN_FRONTEND_URL) {
      document.location.href = process.env.REACT_APP_ADMIN_FRONTEND_URL;
    } else {
      document.location.href = "/";
    }
  }

  useEffect(() => {
    localStorage.removeItem(userToken)
    const storedCheckInClubId = sessionStorage.getItem(checkInClubId);
    const path = props.location.pathname;
    const m = path.match(/\d+/);
    const id = m !== null ? m.shift() : null;
    // checkInClubId is set by the youth worker when they click on the log in button for a club.
    // This prevents the users from manually changing the club id in the browser address bar.
    if (id !== storedCheckInClubId) {
      logout();
    }
  }, [props.location.pathname])

  // reload the page in 3 minutes to fix qr reader stopping scanning after a period of time
  useEffect(() => {
    const timer = setTimeout(() => window.location.reload(), 180000);
    return () => clearTimeout(timer);
  }, [])

  const tryToPlayAudio = (success) => {
    if (success) {
      successSound.currentTime = 0;
      successSound.volume = 1;
      return successSound.play();
    } else {
      errorSound.currentTime = 0;
      errorSound.volume = 0.1;
      return errorSound.play();
    }
  };

  const handleCheckInReturn = (success) => {
    setLoading(false);
    setShowQRCode(false)
    setCheckInSuccess(success)
    setShowQrCheckNotification(true);
    tryToPlayAudio(success).catch(() => notify('Audion toistaminen epäonnistui. Tarkista selaimesi oikeudet.', 'warning'));
    setTimeout(() => {
      setShowQrCheckNotification(false);
      setCheckInSuccess(null);
      setShowQRCode(true);
    }, success ? 2500 : 3000);
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
      await httpClient(url, options, true)
        .then(response => {
          if (response.statusCode < 200 || response.statusCode >= 300) {
              setLoading(false);
              notify('Jokin meni pieleen! Kokeile uudestaan.', 'warning')
            setShowQRCode(true)
          } else {
            handleCheckInReturn(response.success);
          }
        });
    }
  };

  const handleError = () => {
    notify('Jokin meni pieleen! Kokeile uudestaan.', 'warning')
  };

  return (
    <Container>
      <Notification />
      <CheckinBackground />
      <NavigationPrompt
        afterConfirm={logout}
        disableNative={true}
        when={true}
      >
        {({ onConfirm, onCancel }) => (
          <ConfirmNavigationModal
            onCancel={onCancel}
            onConfirm={onConfirm}
          />
        )}
      </NavigationPrompt>
      {showQRCode && (
          <QrReaderContainer>
            <QrReader
                delay={300}
                onScan={handleScan}
                onError={handleError}
                facingMode="user"
                style={{ width: "100%", height: "100%" }}
            />
          </QrReaderContainer>
      )}
      {}
      {showQrCheckNotification && <QrCheckResultScreen successful={checkInSuccess} />}
      {loading && (
          <LoadingMessage message={'Odota hetki'}/>
      )}
    </Container>
  )
};

export default CheckInView;
