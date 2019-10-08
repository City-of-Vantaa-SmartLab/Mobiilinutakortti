import React, {useState} from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { authTypes, authActions } from '../../types/authTypes';
import { AppState } from '../../reducers';

const Form = styled.form`
    display: flex;
    flex-direction: column;
    padding: 2rem;
`;

const Input = styled.input`
    border: 0.1rem solid black;
    padding: 0.5rem;
    margin: 0.5rem 0;
`;

const Button = styled.button`
    background: yellow;
    padding: 0.5rem;
    margin: 0.5rem 0;
`;

const FormHeader = styled.h3`
`;

const Error = styled.p` 
    display: ${(props: {active:boolean}) => props.active ? "block" : "None"};
`


interface LoginProps {
    auth: (phone: string, password: string) => void;
    authReducer: {
        loggedIn: boolean,
        token: string,
        error: string
    }
}

const LoginPage: React.FC<LoginProps> = (props) => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = () => {
        if (phone && password) {
            props.auth(phone, password);
            setPhone('');
            setPassword('');
        }
    }

    return (
        <Form onSubmit={e => {e.preventDefault();
                              handleSubmit()}}>
            <FormHeader>Kirjaudu sisään</FormHeader>
            <Error active = {props.authReducer.error !== ''}>{props.authReducer.error}</Error>
            <Input 
                onChange={e => {
                    setPhone(e.target.value)
                    }
                } 
                value={phone} 
                placeholder='puhelinnumero'/>
            <Input 
                onChange={e => {
                    setPassword(e.target.value)
                    }
                } 
                value = {password} 
                type='password' 
                placeholder='salasana'/>
            <Button type='submit'>Kirjaudu</Button>
        </Form>
    )
}

const mapStateToProps = (state:AppState) => ({
        authReducer: state.auth 
    });

const mapDispatchToProps = (dispatch: Dispatch<authActions>) => {
    return {
        auth: (phone: string, password: string) => {
            dispatch({type: authTypes.AUTH_ATTEMPT, 
                      payload: {phone, password}});
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);