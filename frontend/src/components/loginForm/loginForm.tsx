import React, { useState } from 'react';
import styled from 'styled-components';
import { validatePhone } from '../../utils';
import { useTranslations } from '../translations';


const Form = styled.form`
    display: flex;
    flex-direction: column;
    z-index: 10;
`;

const Input = styled.input`
    outline: none;
    box-shadow: none;
    border-width: 0
    border-radius: 0.3rem;
    padding: 1rem;
    margin: 1rem 0 0.5rem 0;
    font-size: 0.9rem;
    &:focus {
        box-shadow: 5px 5px 5px rgba(0,0,0,0.2);
    }
`;

const Button = styled.button`
    font-family: 'GT-Walsheim';
    background: rgb(249, 229, 30);
    border-radius: 0.3rem;
    border: none;
    padding: 1rem;
    margin: 0.5rem 0;
    font-size: 0.9rem;
    &:focus {
        outline: None;
    }
`;

const FormHeader = styled.label`
    color: white;
`;

interface LoginForm {
    onSubmit: (phone: string, error: boolean) => void,
    disabled: boolean
}

const LoginForm: React.FC<LoginForm> = (props) => {
    const t = useTranslations()
    const [phone, setPhone] = useState('');

    const handleSubmit = () => {
        if (validatePhone(phone)) {
            props.onSubmit(phone, false)
        }
        else {
            props.onSubmit('', true)
        }
        setPhone('');
    }

    return (
        <Form onSubmit={e => {
            e.preventDefault();
            if (phone) handleSubmit()
        }}>
            <FormHeader>{t.login.label}</FormHeader>
            <Input
                onChange={e => {
                    setPhone(e.target.value)
                }
                }
                value={phone}
                placeholder={t.login.placeholder}
                disabled={props.disabled} />
            <Button type='submit' disabled={props.disabled}>{t.login.submit}</Button>
        </Form>
    );
}

export default LoginForm;
