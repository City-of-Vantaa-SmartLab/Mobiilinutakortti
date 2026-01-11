import styled from 'styled-components';

export const Container = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

export const cameraSize = '38em';

/* The video is mirrored horizontally for easier QR code positioning (except for mobile back camera). */
export const QrReaderContainer = styled.div<{ $shouldFlip: boolean }>`
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
`;
