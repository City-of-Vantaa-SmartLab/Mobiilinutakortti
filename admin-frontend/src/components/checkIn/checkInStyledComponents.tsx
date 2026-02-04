import styled from 'styled-components';

export const Container = styled.div<{ $isPopup?: boolean }>`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  ${props => props.$isPopup ? `
    position: relative;
    z-index: 1;
  ` : ''}
`;

export const cameraSize = '38em';

/* The video is mirrored horizontally for easier QR code positioning (except for mobile back camera). */
export const QrReaderContainer = styled.div<{ $shouldFlip: boolean }>`
  width: min(${cameraSize}, 60vw, 60vh);
  height: min(${cameraSize}, 60vw, 60vh);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 3vw solid #f9e51e;
  -webkit-box-shadow: 2px 10px 60px -19px rgba(0,0,0,0.75);
  -moz-box-shadow: 2px 10px 60px -19px rgba(0,0,0,0.75);
  box-shadow: 2px 10px 60px -19px rgba(0,0,0,0.75);
  box-sizing: border-box;
  overflow: hidden;

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: ${props => props.$shouldFlip ? 'scaleX(-1)' : 'none'};
  }
`;
