import { useState, useEffect } from 'react';
import { Notification } from 'react-admin';
import { Scanner } from '@yudiel/react-qr-scanner';
import QrCheckResultScreen from './qrCheckResultScreen.js';
import LoadingMessage from '../loadingMessage';
import { useNotify } from 'react-admin';
import { httpClient } from '../../httpClients/httpClient';
import api from '../../api';
import CheckinBackground from './checkInBackground.js';
import { checkInClubIdKey, userTokenKey, adminUiBasePath, checkInSecurityCodeKey, clearUserInfo } from '../../utils';
import { Button } from '@mui/material';
import SwitchCameraIcon from '@mui/icons-material/SwitchCamera';
import { Container, QrReaderContainer } from './checkInStyledComponents';
import { setupCameras, shouldFlipCameraView, tryToPlayAudio, switchCamera, getCameraConstraints } from './checkInHelpers';

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
    setupCameras().then(result => {
      if (isMounted) {
        setShowCameraToggle(result.showCameraToggle);
        setCameras(result.cameras);
        setUseFacingMode(result.useFacingMode);
      }
    });
    return () => { isMounted = false; };
  }, [])

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
        targetId: clubId,
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

  return (
    <Container>
      <Notification />
      <CheckinBackground />
      {showQRCode && (
          <QrReaderContainer $shouldFlip={shouldFlipCameraView(useFacingMode, currentCameraIndex, cameras)}>
            <Scanner
                scanDelay={500}
                onScan={handleScan}
                onError={handleError}
                formats={['qr_code']}
                constraints={getCameraConstraints(useFacingMode, currentCameraIndex, cameras)}
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
            setCurrentCameraIndex(switchCamera(useFacingMode, currentCameraIndex, cameras));
          }}
        >
          <SwitchCameraIcon />&nbsp;&nbsp;Vaihda&nbsp;kameraa
        </Button>
      )}
    </Container>
  );
};

export default CheckInView;
