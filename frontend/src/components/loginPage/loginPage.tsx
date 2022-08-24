import React, { useState, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { useLocation, useNavigate } from 'react-router-dom';

import { authTypes, authActions } from '../../types/authTypes';
import { AppState } from '../../reducers';
import LoginBackground from '../loginBackground';
import LoginForm from '../loginForm/loginForm';
import { useTranslations } from '../translations';
import LanguageSelect from '../LanguageSelect'

export const Container = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    background: ${p => p.theme.pages.login.background};
    overflow: scroll;
    box-shadow: 12px 24px 100px rgba(0, 0, 0, 0.5);
    @media (min-width: 600px) {
        max-height: 812px;
        max-width: 480px;
        margin: auto;
    }
`;

const Wrapper = styled.div`
    height: 100%;
`;

const LoginWrapper = styled.section`
    padding: 0 2.5rem;
    position: relative;
    z-index: 10;
`;

const Header = styled.h1`
    font-family: ${p => p.theme.fonts.heading};
    color: ${p => p.theme.pages.login.headingText};
    text-transform: uppercase;
    text-align: center;
    font-size: 11vw;
    font-weight: 700;
    @media(min-width: 600px) {
        font-size: 3.4rem;
    }
`;


const Message = styled.div<{ $active: boolean, $error: boolean }>`
    display: ${(props) => props.$active ? 'flex' : 'none'};
    align-items: center;
    flex-direction: row;
    width: 100%;
    border-bottom: 2px solid ${(p) => p.$error ? p.theme.pages.login.errorText : p.theme.pages.login.messageText};
    padding: 0;
    margin-bottom: 1.5rem;
    box-sizing: border-box;
    color: ${(p) => p.$error ? p.theme.pages.login.errorText : p.theme.pages.login.messageText};
`;

const ErrorMessageIcon = styled.div<{ $visible: boolean }>`
    font-size: 1.4rem;
    padding-right: 0.5rem;
    display: ${(props) => props.$visible ? 'block' : 'none'};
    &:before {
        content: '\f07d';
        font-family: 'fontello';
        display: block;
    }
`;

const MessageText = styled.p`

`;

interface LoginProps {
    auth: (challenge: string, id: string) => void,
    authLinkRequest: (phone: string) => void,

    authError: boolean,
    authMessage: 'authFail' | 'linkRequestSuccess' | 'linkRequestFail' | null,
    loggingIn: boolean,
    loggedIn: boolean
}

const LoginPage: React.FC<LoginProps> = ({ auth, authLinkRequest, authError, authMessage , loggingIn, loggedIn }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const t = useTranslations()
    const theme = useTheme()
    const [message, setMessage] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        //authenticate with login link
        const query = new URLSearchParams(location.search);
        const challenge = query.get('challenge');
        const id = query.get('id');
        if (challenge && id) {
            auth(challenge, id);
        }
    }, [location.search, auth]);

    useEffect(() => {
        if ((authError || authMessage !== null) && !error) {
            setError(authError);
            if (authMessage !== null) {
              setMessage(t.login.authMessages[authMessage] ?? '');
            } else {
              setMessage('')
            }
        }
    }, [authError, authMessage, error, t.login.authMessages]);

    useEffect(() => {
        if (loggedIn) {
            navigate('/')
        }
    }, [navigate, loggedIn]);


    const sendLink = (phoneNumber: string, error: boolean) => {
        if (error) {
            setError(true);
            setMessage(t.login.errorMessage);
        } else {
            setError(false);
            authLinkRequest(phoneNumber);
            setMessage('');
        }
        navigate('/login');
    }

    return (
        <Container>
        <Wrapper>
            <LoginBackground />
            {theme.pages.login.logo}
            <LanguageSelect color={theme.pages.login.languageSelectText} />
            <LoginWrapper>
                <Header>{t.login.title}</Header>
                <Message $active={message !== ''} $error={error}>
                    <ErrorMessageIcon $visible={error} />
                    <MessageText>{message}</MessageText>
                </Message>
                <LoginForm onSubmit={sendLink} disabled={loggingIn} />
            </LoginWrapper>
            {theme.pages.login.bottomLogo}
        </Wrapper>
        </Container>
    )
}

const mapStateToProps = (state: AppState) => ({
    authError: state.auth.error,
    authMessage: state.auth.message,
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
