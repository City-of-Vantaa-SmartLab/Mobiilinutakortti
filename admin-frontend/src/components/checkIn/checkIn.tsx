import { useState, useEffect } from 'react';
import { Notification } from 'react-admin';
import { Scanner } from '@yudiel/react-qr-scanner';
import QrCheckResultScreen from './qrCheckResultScreen.js';
import LoadingMessage from '../loadingMessage';
import { useNotify } from 'react-admin';
import { httpClient } from '../../httpClients/httpClient';
import api from '../../api';
import CheckinBackground from './checkInBackground.js';
import { checkInTargetIdKey, userTokenKey, adminUiBasePath, checkInSecurityCodeKey, clearUserInfo, checkInForEventKey } from '../../utils';
import { Button } from '@mui/material';
import SwitchCameraIcon from '@mui/icons-material/SwitchCamera';
import { Container, QrReaderContainer } from './checkInStyledComponents';
import { setupCameras, shouldFlipCameraView, tryToPlayAudio, switchCamera, getCameraConstraints } from './checkInHelpers';

const CheckInView = () => {
  const [showQRCode, setShowQRCode] = useState(true);
  const [showQrCheckNotification, setShowQrCheckNotification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkInName, setCheckInName] = useState(null);
  const [showCameraToggle, setShowCameraToggle] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [useFacingMode, setUseFacingMode] = useState(true);
  const [targetId, setTargetId] = useState(null);
  const [securityCode, setSecurityCode] = useState(null);
  const [isEventCheckIn, setIsEventCheckIn] = useState(null);
  const [needsReload, setNeedsReload] = useState(false);
  const notify = useNotify();

  useEffect(() => {
    sessionStorage.removeItem(userTokenKey);
    clearUserInfo();

    // Security could be made a bit tighter with rotating codes.
    // Emptying the session storage would result in need to re-login if refreshing the page.
    // This might be somewhat inconvenient with current use cases.
    const storedTargetId = sessionStorage.getItem(checkInTargetIdKey);
    const storedSecurityCode = sessionStorage.getItem(checkInSecurityCodeKey);
    const forEvent: boolean = !!sessionStorage.getItem(checkInForEventKey);

    if (storedTargetId === null || storedSecurityCode === null) {
      console.debug("Missing required info.");
      setTimeout(() => { document.location.href = adminUiBasePath }, 100);
    }
    setTargetId(storedTargetId);
    setSecurityCode(storedSecurityCode);
    setIsEventCheckIn(forEvent);

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

  const handleCheckInReturn = (checkInName: string, needsNewSecurityCode: boolean) => {
    setLoading(false);
    setShowQRCode(false)
    setCheckInName(checkInName)
    setShowQrCheckNotification(true);
    tryToPlayAudio(!!checkInName).catch(() => notify('Audion toistaminen epäonnistui. Tarkista selaimesi oikeudet.', { type: 'warning' }));
    setTimeout(() => {
      setCheckInName(null);
      setShowQrCheckNotification(false);
      setShowQRCode(!needsNewSecurityCode);
      setNeedsReload(needsNewSecurityCode);
    }, checkInName ? 2500 : 3000);
  };

  const handleScan = async (detectedCodes: any[]) => {
    if (detectedCodes) {
      setShowQRCode(false);
      setLoading(true);

      const url = isEventCheckIn ? api.event.checkInWithCode : api.youthClub.checkIn;
      const body = JSON.stringify({
        targetId: targetId,
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
            handleCheckInReturn(response.checkInName, needsNewSecurityCode);
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
      {showQrCheckNotification && <QrCheckResultScreen checkInName={checkInName} />}
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
