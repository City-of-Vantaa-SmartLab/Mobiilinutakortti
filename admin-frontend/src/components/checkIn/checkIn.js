import React, { useState, useEffect } from 'react';
import { Notification } from 'react-admin';
import QrReader from 'react-qr-reader';
import QrCheckResultScreen from './qrCheckResultScreen.js';
import LoadingMessage from '../loadingMessage';
import { useNotify } from 'react-admin';
import styled from 'styled-components';
import { httpClient } from '../../httpClients';
import api from '../../api';
import CheckinBackground from './checkInBackground.js';
import { successSound, errorSound } from '../../audio/audio.js'
import { checkInClubIdKey, userTokenKey, appUrl, checkInSecurityCodeKey, clearUserInfo } from '../../utils';
import { Button } from '@material-ui/core';
import SwitchCameraIcon from '@material-ui/icons/SwitchCamera';

const Container = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const cameraSize = '38em';

const QrReaderContainer = styled.div`
  max-width: ${cameraSize};
  max-height: ${cameraSize};
  width: 100%;
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  border: 3em solid #f9e51e;
  -webkit-box-shadow: 2px 10px 60px -19px rgba(0,0,0,0.75);
  -moz-box-shadow: 2px 10px 60px -19px rgba(0,0,0,0.75);
  box-shadow: 2px 10px 60px -19px rgba(0,0,0,0.75);
  box-sizing: border-box;
`

const CheckInView = () => {
  const [showQRCode, setShowQRCode] = useState(true);
  const [showQrCheckNotification, setShowQrCheckNotification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(null);
  const [showCameraToggle, setShowCameraToggle] = useState(false);
  const [useAlternativeCamera, setUseAlternativeCamera] = useState(false);
  const [clubId, setClubId] = useState(null);
  const [securityCode, setSecurityCode] = useState(null);
  const [needsReload, setNeedsReload] = useState(false);
  const notify = useNotify();

  useEffect(() => {
    sessionStorage.removeItem(userTokenKey);
    clearUserInfo();

    // Security could be made a bit tighter with rotating codes.
    // Emptying the session storage would result in need to re-login if refreshing the page.
    // This might be somewhat inconvenient with current use cases.
    const storedClubId = sessionStorage.getItem(checkInClubIdKey);
    const storedSecurityCode = sessionStorage.getItem(checkInSecurityCodeKey);

    if (storedClubId === null || storedSecurityCode === null) {
      console.debug("Missing required info.");
      setTimeout(() => { document.location.href = appUrl }, 100);
    }
    setClubId(storedClubId);
    setSecurityCode(storedSecurityCode);

    let isMounted = true;
    navigator.mediaDevices.enumerateDevices().then(devices => {
      if (isMounted) {
        const cameras = devices.filter(dev => dev.kind === 'videoinput');
        if (cameras.length > 1) setShowCameraToggle(true);
        console.debug(cameras);
      }
    })
    return () => isMounted = false;
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

  const handleCheckInReturn = (success, needsNewSecurityCode) => {
    setLoading(false);
    setShowQRCode(false)
    setCheckInSuccess(success)
    setShowQrCheckNotification(true);
    tryToPlayAudio(success).catch(() => notify('Audion toistaminen epäonnistui. Tarkista selaimesi oikeudet.', 'warning'));
    setTimeout(() => {
      setCheckInSuccess(null);
      setShowQrCheckNotification(false);
      setShowQRCode(!needsNewSecurityCode);
      setNeedsReload(needsNewSecurityCode);
    }, success ? 2500 : 3000);
  };

  const handleScan = async (qrData) => {
    if (qrData) {
      setShowQRCode(false);
      setLoading(true);
      const url = api.youthClub.checkIn;
      const body = JSON.stringify({
        clubId,
        securityCode,
        juniorId: qrData
      });
      const options = {
        method: 'POST',
        body
      };
      await httpClient(url, options, true)
        .then(response => {
          // Response is of type CheckInResponseViewModel in backend.
          if (response.statusCode < 200 || response.statusCode >= 300) {
              setLoading(false);
              notify('Jokin meni pieleen! Kokeile uudestaan.', 'warning')
            setShowQRCode(true)
          } else {
            const needsNewSecurityCode = response.reason === 'CODE';
            handleCheckInReturn(response.success, needsNewSecurityCode);
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
      {showQRCode && (
          <QrReaderContainer>
            <QrReader
                delay={300}
                onScan={handleScan}
                onError={handleError}
                facingMode={useAlternativeCamera ? 'environment' : 'user'}
                style={{ width: {cameraSize}, height: {cameraSize} }}
            />
          </QrReaderContainer>
      )}
      {needsReload && (
          <LoadingMessage message={'Nuorisotyöntekijän on avattava kirjautumissivu uudelleen.'}/>
      )}
      {showQrCheckNotification && <QrCheckResultScreen successful={checkInSuccess} />}
      {loading && (
          <LoadingMessage message={'Odota hetki'}/>
      )}
      {(showCameraToggle) && (
        <Button
          style={{ position: 'absolute', bottom: '2em' }}
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
