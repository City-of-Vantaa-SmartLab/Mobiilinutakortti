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
import { Button, Paper } from '@mui/material';
import SwitchCameraIcon from '@mui/icons-material/SwitchCamera';
import CloseIcon from '@mui/icons-material/Close';
import { Container, QrReaderContainer } from './checkInStyledComponents';
import { setupCameras, shouldFlipCameraView, tryToPlayAudio, switchCamera, getCameraConstraints } from './checkInHelpers';

const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
`;

const PopupContainer = styled(Paper)`
  position: relative;
  width: 70vw;
  height: 70vh;
  max-width: 1200px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const CloseButton = styled(Button)`
  position: absolute !important;
  top: 1em;
  right: 1em;
  z-index: 10;
  min-width: 60px !important;
  min-height: 60px !important;
  border-radius: 50% !important;
  svg {
    font-size: 2em;
  }
`;

const CameraSwitchButton = styled(Button)`
  position: absolute !important;
  bottom: 2em;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
`;

interface CheckInPopupProps {
  eventId: number;
  onClose: () => void;
}

const CheckInPopup = ({ eventId, onClose }: CheckInPopupProps) => {
  const [showQRCode, setShowQRCode] = useState(true);
  const [showQrCheckNotification, setShowQrCheckNotification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState(null);
  const [errorReason, setErrorReason] = useState<string | undefined>(undefined);
  const [showCameraToggle, setShowCameraToggle] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [useFacingMode, setUseFacingMode] = useState(true);
  const notify = useNotify();

  useEffect(() => {
    let isMounted = true;
    setupCameras().then(result => {
      if (isMounted) {
        setShowCameraToggle(result.showCameraToggle);
        setCameras(result.cameras);
        setUseFacingMode(result.useFacingMode);

        if (result.cameras.length > 1 && result.useFacingMode) {
          setCurrentCameraIndex(1); // Default to back camera (typically index 1)
        }
      }
    });
    return () => { isMounted = false; };
  }, [])

  const handleCheckInReturn = (success: boolean, reason?: string) => {
    setLoading(false);
    setShowQRCode(false)
    setCheckInSuccess(success)
    setErrorReason(reason)
    setShowQrCheckNotification(true);
    tryToPlayAudio(success).catch(() => notify('Audion toistaminen epäonnistui. Tarkista selaimesi oikeudet.', { type: 'warning' }));
    setTimeout(() => {
      setCheckInSuccess(null);
      setErrorReason(undefined);
      setShowQrCheckNotification(false);
      setShowQRCode(true);
    }, success ? 2500 : 3000);
  };

  const handleScan = async (detectedCodes: any[]) => {
    if (detectedCodes) {
      setShowQRCode(false);
      setLoading(true);

      const url = api.event.checkIn;
      const body = JSON.stringify({
        targetId: eventId,
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
            handleCheckInReturn(response.success, response.reason);
          }
        });
    }
  };

  const handleError = (e: any) => {
    console.error(e);
    notify('Jokin meni pieleen! Kokeile uudestaan.', { type: 'warning' })
  };

  return (
    <PopupOverlay onClick={onClose}>
      <PopupContainer onClick={(e) => e.stopPropagation()}>
        <CloseButton
          onClick={onClose}
          variant="contained"
          color="error"
        >
          <CloseIcon />
        </CloseButton>
        {(showCameraToggle) && (
          <CameraSwitchButton
            color="primary"
            size="large"
            variant="contained"
            onClick={() => {
              setCurrentCameraIndex(switchCamera(useFacingMode, currentCameraIndex, cameras));
            }}
          >
            <SwitchCameraIcon />&nbsp;&nbsp;Vaihda&nbsp;kameraa
          </CameraSwitchButton>
        )}
        <Container $isPopup={true}>
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
          {showQrCheckNotification && <QrCheckResultScreen successful={checkInSuccess} errorReason={errorReason} />}
          {loading && (
              <LoadingMessage message={'Odota hetki'}/>
          )}
        </Container>
      </PopupContainer>
    </PopupOverlay>
  );
};

export default CheckInPopup;
