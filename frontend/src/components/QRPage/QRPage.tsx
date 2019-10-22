import React, {useState} from 'react';
import styled from 'styled-components';
import QRCode from 'qrcode.react';
import Measure from 'react-measure'
import { connect } from 'react-redux';
import { AppState } from '../../reducers';

const Wrapper=styled.section`
    height: 100%;
    width: 100%;
    position: relative;
    background: linear-gradient(-15deg, white, white 55%, transparent 55%, transparent);
`;


const QRWrapper=styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 2.5rem;
    
`;

const QRContainer=styled.div`
    width: 100%;
    background: rgb(249, 229, 30);
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
    border-radius: 0.5rem;
    position: relative;
    box-sizing: border-box;
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

const Title=styled.h1`
    font-weight: bold;
    color: rgb(249, 229, 30);
    text-align: center;
    font-size: 10vw;
    position: absolute;
    width: 100%;
    padding-top: 2rem;
    @media(min-width: 600px) {
        font-size: 3rem;
    }
`;

interface QRPageProps {
    id: string,
    name: string,
} 

const QRPage: React.FC<QRPageProps> = (props) => {
    const [size, setSize] = useState(0);

    return (
        <Wrapper>
            <Title>Kirjaudu Nutalle</Title>
            <QRWrapper>
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
                        <QRContainer ref={measureRef}>
                            <QRCode value='123' includeMargin={true} size={size}/>
                        </QRContainer>
                    )}
                </Measure>        
            </QRWrapper>
        </Wrapper>
    );
}


const mapStateToProps = (state:AppState) => ({
    id: state.user.id,
    name: state.user.name
});


export default connect(mapStateToProps)(QRPage);