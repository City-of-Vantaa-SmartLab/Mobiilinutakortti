import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { RouteComponentProps } from 'react-router-dom';

import { authTypes, authActions } from '../../types/authTypes';
import { AppState } from '../../reducers';
import LoginBackground from '../loginBackground';
import LoginForm from '../loginForm/loginForm';
import { Container } from '../Container';

const Wrapper = styled.div`
    height: 100%;
`;

const LoginWrapper = styled.section`
    padding: 0 2.5rem;
    position: relative;
    z-index: 10;
`;

const Header = styled.h1`
    color: rgb(249, 229, 30);
    text-transform: uppercase;
    text-align: center;
    font-size: 11vw;
    font-weight: 700;
    @media(min-width: 600px) {
        font-size: 3.4rem;
    }
`;


const Message = styled.div<{ active: boolean, error: boolean }>` 
    display: ${(props) => props.active ? "flex" : "None"};
    align-items: center;
    flex-direction: row;
    width: 100%;
    border-bottom: 2px solid ${(props) => props.error ? 'rgb(249, 229, 30)' : "#99e6ff"};
    padding: 0;
    margin-bottom: 1.5rem;
    box-sizing: border-box;
    color: ${(props) => props.error ? 'rgb(249, 229, 30)' : "#99e6ff"};
    

`;

const ErrorMessageIcon = styled.div<{ visible: boolean }>`
    font-size: 1.4rem;
    padding-right: 0.5rem;
    display: ${(props) => props.visible ? "block" : "None"};
    &:before {
        content: '\f07d';
        font-family: 'fontello';
        display: block;
    }
`;

const MessageText = styled.p`

`;

interface LoginProps extends RouteComponentProps {
    auth: (challenge: string, id: string) => void,
    authLinkRequest: (phone: string) => void,

    authError: boolean,
    loggingIn: boolean,
    loggedIn: boolean
}

const LoginPage: React.FC<LoginProps> = (props) => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        //authenticate with login link
        const query = new URLSearchParams(props.location.search);
        const challenge = query.get('challenge');
        const id = query.get('id');
        if (challenge && id) {
            props.auth(challenge, id);
        }
    }, []);

    useEffect(() => {
        if (props.authError && !error) {
            setError(true);
            setMessage('Kirjautuminen epäonnistui. Syötä puhelinnumerosi saadaksesi uuden kirjautumislinkin');
        }
    }, [props.authError, error]);

    useEffect(() => {
        if (props.loggedIn) {
            props.history.push('/')
        }
    }, [props.loggedIn, props.history]);


    const sendLink = (phoneNumber: string, error: boolean) => {
        if (error) {
            setError(true);
            setMessage('Tarkista, että antamasi puhelinnumero on oikein');
        } else {
            setError(false);
            props.authLinkRequest(phoneNumber);
            setMessage('');
        }
        props.history.push('/login');
    }

    return (
        <Container>
        <Wrapper>
            <LoginBackground />
            <LoginWrapper>
                <Header>Nutakortti</Header>
                <Message active={message !== ''} error={error}>
                    <ErrorMessageIcon visible={error}></ErrorMessageIcon>
                    <MessageText>{message}</MessageText>
                </Message>
                <LoginForm onSubmit={sendLink} disabled={props.loggingIn} />
            </LoginWrapper>
        </Wrapper>
        </Container>
    )
}

const mapStateToProps = (state: AppState) => ({
    authError: state.auth.error,
    loggingIn: state.auth.loggingIn,
    loggedIn: state.auth.loggedIn
});

const mapDispatchToProps = (dispatch: Dispatch<authActions>) => {
    return {
        auth: (challenge: string, id: string) => {
            dispatch({
                type: authTypes.AUTH_ATTEMPT,
                payload: { challenge, id }
            });
        },
        authLinkRequest: (phoneNumber: string) => {
            dispatch({
                type: authTypes.AUTH_LINK_REQUEST,
                payload: { phoneNumber }
            });
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
