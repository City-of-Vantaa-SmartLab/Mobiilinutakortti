import React, {useState} from 'react';
import styled from 'styled-components';
import QRCode from 'qrcode.react';
import Measure from 'react-measure'
import { useTranslations } from "../translations";

const QRWrapper = styled.section`
    display: flex;
    justify-content: center;
`

const QRContainer = styled.div<{ active: boolean }>`
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 70vh;
    background: ${p => p.theme.pages.qr.qrBorder};
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
    border-radius: 0.5rem;
    position: relative;
    box-sizing: border-box;
    opacity: ${(props) => props.active ? 1 : 0};
    transition: opacity 0.2s ease-in;
    & > * {
        flex: 1 100%;
    }
    &:before {
        padding-top: 100%;
        content: "";
        display: block;
    }
    & > canvas {

        border-radius: 0.3rem;
        position: absolute;
        top: 8%;
        left:  8%;
        bottom: 8%;
        right: 8%;
    }
`;

const QRStatusMessage = styled.span<{ expired: boolean }>`
    display: flex;
    flex-direction: column;
    justify-content: center;
    color: ${(props) => (props.expired ? "#f7423a" : "#6bc24a")};
`;

interface QRProps {
    id: string
    status: string
}

const QR: React.FC<QRProps> = (props) => {
  const t = useTranslations();
  const [size, setSize] = useState(0);
  const statusMessage = props.status === "expired" ? t.qrPage.codeExpired : t.qrPage.codeValid;

    return (
      <QRWrapper>
        <Measure
            bounds
            onResize={contentRect => {
                if (contentRect.bounds) {
                    setSize(contentRect.bounds.width-contentRect.bounds.width*0.16)
                  }
            }}
        >
            {({ measureRef }) => (
                <QRContainer ref={measureRef} active={props.id !== ''}>
                    <QRCode value={props.id} includeMargin={true} size={size}/>
                    <QRStatusMessage expired={props.status === "expired"}>
                        {statusMessage}
                    </QRStatusMessage>
                </QRContainer>
            )}
        </Measure>
      </QRWrapper>
    );
}

export default QR;
