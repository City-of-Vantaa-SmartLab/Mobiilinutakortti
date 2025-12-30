import { useState, useEffect } from 'react';
import { Notification } from 'react-admin';
import { Scanner } from '@yudiel/react-qr-scanner';
import QrCheckResultScreen from './qrCheckResultScreen.js';
import LoadingMessage from '../loadingMessage';
import { useNotify } from 'react-admin';
import styled from 'styled-components';
import { httpClient } from '../../httpClients/httpClient';
import api from '../../api';
import CheckinBackground from './checkInBackground.js';
import { successSound, errorSound } from '../../audio/audio.js'
import { checkInClubIdKey, userTokenKey, adminUiBasePath, checkInSecurityCodeKey, clearUserInfo } from '../../utils';
import { Button } from '@mui/material';
import SwitchCameraIcon from '@mui/icons-material/SwitchCamera';

const Container = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const cameraSize = '38em';

/* The video is mirrored horizontally for easier QR code positioning (except for mobile back camera). */
const QrReaderContainer = styled.div<{ $shouldFlip: boolean }>`
  max-width: ${cameraSize};
  max-height: ${cameraSize};
  width: 100%;
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  border: 3vw solid #f9e51e;
  -webkit-box-shadow: 2px 10px 60px -19px rgba(0,0,0,0.75);
  -moz-box-shadow: 2px 10px 60px -19px rgba(0,0,0,0.75);
  box-shadow: 2px 10px 60px -19px rgba(0,0,0,0.75);
  box-sizing: border-box;

  video {
    transform: ${props => props.$shouldFlip ? 'scaleX(-1)' : 'none'};
  }
`

const CheckInView = () => {
  const [showQRCode, setShowQRCode] = useState(true);
  const [showQrCheckNotification, setShowQrCheckNotification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(null);
  const [showCameraToggle, setShowCameraToggle] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [useFacingMode, setUseFacingMode] = useState(true);
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
      setTimeout(() => { document.location.href = adminUiBasePath }, 100);
    }
    setClubId(storedClubId);
    setSecurityCode(storedSecurityCode);

    let isMounted = true;
    navigator.mediaDevices.enumerateDevices().then(devices => {
      if (isMounted) {
        const videoCameras = devices.filter(dev => dev.kind === 'videoinput');
        console.debug('Available cameras:', videoCameras);

        if (videoCameras.length > 1) {

          // Not all cameras list their facing modes.
          const hasDifferentFacingModes = videoCameras.some(cam =>
            (cam as any).facingMode === 'environment'
          ) && videoCameras.some(cam =>
            (cam as any).facingMode === 'user' || !(cam as any).facingMode
          );

          // Sometimes cameras have a label such as "facing front" or "facing back".
          const hasLabelBasedFacing = videoCameras.some(cam =>
            cam.label.toLowerCase().includes('facing')
          );

          if (hasDifferentFacingModes || hasLabelBasedFacing) {
            console.debug('Using facingMode toggle (mobile/tablet)');
            setUseFacingMode(true);
            setCameras(videoCameras.slice(0, 2));
          } else {
            console.debug('Using deviceId toggle (PC with multiple webcams)');
            setUseFacingMode(false);
            setCameras(videoCameras.slice(0, 2));
          }
          setShowCameraToggle(true);
        }
      }
    })
    return () => { isMounted = false; };
  }, [])

  const tryToPlayAudio = (success: boolean) => {
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

  const handleCheckInReturn = (success: boolean, needsNewSecurityCode: boolean) => {
    setLoading(false);
    setShowQRCode(false)
    setCheckInSuccess(success)
    setShowQrCheckNotification(true);
    tryToPlayAudio(success).catch(() => notify('Audion toistaminen epäonnistui. Tarkista selaimesi oikeudet.', { type: 'warning' }));
    setTimeout(() => {
      setCheckInSuccess(null);
      setShowQrCheckNotification(false);
      setShowQRCode(!needsNewSecurityCode);
      setNeedsReload(needsNewSecurityCode);
    }, success ? 2500 : 3000);
  };

  const handleScan = async (detectedCodes: any[]) => {
    if (detectedCodes) {
      setShowQRCode(false);
      setLoading(true);

      const url = api.youthClub.checkIn;
      const body = JSON.stringify({
        clubId,
        securityCode,
        juniorId: detectedCodes[0].rawValue
      });
      const options = {
        method: 'POST',
        body
      };
      await httpClient(url, options)
        .then(response => {
          // Response is of type CheckInResponseViewModel in backend.
          if (response.statusCode < 200 || response.statusCode >= 300) {
              setLoading(false);
              notify('Jokin meni pieleen! Kokeile uudestaan.', { type: 'warning' })
            setShowQRCode(true)
          } else {
            const needsNewSecurityCode = response.reason === 'CODE';
            handleCheckInReturn(response.success, needsNewSecurityCode);
          }
        });
    }
  };

  const handleError = (e: any) => {
    console.error(e);
    notify('Jokin meni pieleen! Kokeile uudestaan.', { type: 'warning' })
  };

  const shouldFlipCameraView = () => {
    // If facing mode is not in question, the camera is probably a web cam in which case it should be treated as a selfie cam.
    if (!useFacingMode) return true;

    // Selfie cameras are usually the first ones.
    if (currentCameraIndex === 0) return true;

    const currentCam = cameras[currentCameraIndex];
    if (!currentCam) return false;

    // Note that sometimes the mobile devices report the cameras wrong. So a back facing camera might actually read front in the label.
    const label = currentCam.label.toLowerCase();
    if (label.includes('front')) return true;

    return false;
  };

  return (
    <Container>
      <Notification />
      <CheckinBackground />
      {showQRCode && (
          <QrReaderContainer $shouldFlip={shouldFlipCameraView()}>
            <Scanner
                scanDelay={500}
                onScan={handleScan}
                onError={handleError}
                formats={['qr_code']}
                constraints={{
                  aspectRatio: 1,
                  ...(useFacingMode
                    ? { facingMode: currentCameraIndex === 0 ? 'user' : 'environment' } // Usually the selfie camera is the first one.
                    : cameras[currentCameraIndex]?.deviceId
                      ? { deviceId: { exact: cameras[currentCameraIndex].deviceId } }
                      : {}
                  )
                }}
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
          onClick={() => {
            if (useFacingMode) {
              const newIndex = currentCameraIndex === 0 ? 1 : 0;
              console.debug('Switching facingMode, new index:', newIndex);
              setCurrentCameraIndex(newIndex);
            } else {
              const newIndex = (currentCameraIndex + 1) % cameras.length;
              console.debug('Switching camera by deviceId, new index:', newIndex, 'deviceId:', cameras[newIndex]?.deviceId);
              setCurrentCameraIndex(newIndex);
            }
          }}
        >
          <SwitchCameraIcon />&nbsp;&nbsp;Vaihda&nbsp;kameraa
        </Button>
      )}
    </Container>
  );
};

export default CheckInView;
