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
import { Button } from '@material-ui/core';
import SwitchCameraIcon from '@material-ui/icons/SwitchCamera';

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
  const [showCameraToggle, setShowCameraToggle] = useState(false);
  const [useAlternativeCamera, setUseAlternativeCamera] = useState(false);
  const notify = useNotify();

  const goToLogin = () => {
    sessionStorage.removeItem(checkInClubId);
    document.location.href = process.env.REACT_APP_ADMIN_FRONTEND_URL || "/";
  }

  useEffect(() => {
    localStorage.removeItem(userToken);
    const storedCheckInClubId = sessionStorage.getItem(checkInClubId);
    const path = props.location.pathname;
    const matchId = path.match(/\d+/);
    const id = matchId !== null ? matchId.shift() : null;
    // checkInClubId is set by the youth worker when they click on the log in button for a club.
    // This prevents the users from manually changing the club id in the browser address bar.
    if (id !== storedCheckInClubId) {
      goToLogin();
    }

    let isMounted = true;
    navigator.mediaDevices.enumerateDevices().then(devices => {
      if (isMounted) {
        const cameras = devices.filter(dev => dev.kind === 'videoinput');
        if (cameras.length > 1) setShowCameraToggle(true);
        console.debug(cameras);
      }
    })
    return () => isMounted = false;
  }, [props.location.pathname])

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

  const handleError = (e) => {
    console.error(e);
    notify('Jokin meni pieleen! Kokeile uudestaan.', 'warning')
  };

  return (
    <Container>
      <Notification />
      <CheckinBackground />
      <NavigationPrompt
        afterConfirm={goToLogin}
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
                facingMode={useAlternativeCamera ? 'environment' : 'user'}
                style={{ width: "100%", height: "100%" }}
            />
          </QrReaderContainer>
      )}
      {}
      {showQrCheckNotification && <QrCheckResultScreen successful={checkInSuccess} />}
      {loading && (
          <LoadingMessage message={'Odota hetki'}/>
      )}
      {(showCameraToggle) && (
        <Button
          style={{ marginTop: '1em' }}
          color="primary"
          size="large"
          variant="contained"
          onClick={() => {const use = !useAlternativeCamera; setUseAlternativeCamera(use)}}
        >
          <SwitchCameraIcon />&nbsp;&nbsp;Vaihda&nbsp;kameraa
        </Button>
      )}
    </Container>
  )
};

export default CheckInView;
