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

const SuccessIcon = styled.div<{size: number}>`
    top: 8%;
    left:  8%;
    bottom: 8%;
    right: 8%;
    background: white;
    position: absolute;
    border-radius: 0.3rem;
    &:before {
        content: '\f06d';
        font-family: 'fontello';
        display: block;
        padding: ${(props) => `${props.size*0.1}px`};
        font-size: ${(props) => `calc(${props.size}px - ${props.size*0.2}px)`};
        color: #4a7829;
    }
`;

interface QRProps {
    id: string,
    checkedIn: boolean
} 

const QR: React.FC<QRProps> = (props) => {
    const [size, setSize] = useState(0);
    let content:any;

    if (!props.checkedIn) {
        content = <QRCode value={props.id} includeMargin={true} size={size}/>
    } else {
        content = <SuccessIcon size={size}/>
    }

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
                    {content}
                </QRContainer>
            )}
        </Measure>   
    );
}

export default QR;