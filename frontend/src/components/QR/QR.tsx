import React, {useState} from 'react';
import styled from 'styled-components';
import QRCode from 'qrcode.react';
import Measure from 'react-measure'


const QRContainer=styled.section<{active: boolean}>`
    width: 100%;
    background: #f9e51e;
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


interface QRProps {
    id: string,
} 

const QR: React.FC<QRProps> = (props) => {
    const [size, setSize] = useState(0);

    return (
        <Measure
            bounds
            onResize={contentRect => {
                if (contentRect.bounds) {
                    setSize(contentRect.bounds.width-contentRect.bounds.width*0.16)
                    }
                }
            }
            >
            {({ measureRef }) => (
                <QRContainer ref={measureRef} active={props.id !== ''}>
                    <QRCode value={props.id} includeMargin={true} size={size}/>
                </QRContainer>
            )}
        </Measure>   
    );
}

export default QR;