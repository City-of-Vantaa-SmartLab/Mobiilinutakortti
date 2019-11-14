import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { AppState } from '../../reducers';
import Title from '../Title/Title';
import QR from '../QR/QR';
import { subscribeToCheckIn } from '../../apis'

import openSocket from 'socket.io-client';

const baseURL = process.env.REACT_APP_ENDPOINT;

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    height: 100%;
    padding: 0 2.5rem;
    text-align: center;
    background: linear-gradient(-15deg, white, white 55%, transparent 55%, transparent);   
`;

const Header = styled.section`
    text-align: center;
    width: 100%;
    color: #f9e51e;
    margin-top: 2.5rem;
    height: 100%;
    & > p {
        font-size: 7vw;
        margin: 0;
    }
`;

const Footer = styled.section`
    padding-top: 2rem;
    height: 100%
`;

interface QRPageProps {
    id: string,
    name: string,
}

const QRPage: React.FC<QRPageProps> = (props) => {
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState("Näytä QR-koodi lukulaitteelle saapuessasi nuorisotalolle");

    useEffect(() => {
        subscribeToCheckIn((err:any, response:any) => {
            if (response.response !== '' && response.success) {
                setSuccess(true)
                setMessage(`Tervetuloa ${response.response}an`);
            }
        });    
    }, []);

    return (
        <Wrapper>
            <Header>
                <Title title='Kirjaudu nutalle' subtitle={props.name} />
            </Header>
            <QR id={props.id} checkedIn={success}/>
            <Footer>{message}</Footer>
        </Wrapper>
    );
}


const mapStateToProps = (state: AppState) => ({
    id: state.user.id,
    name: state.user.name
});


export default connect(mapStateToProps)(QRPage);
