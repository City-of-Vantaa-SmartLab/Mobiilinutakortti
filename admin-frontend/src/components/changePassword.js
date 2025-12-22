import React, { useState } from 'react';
import { SimpleForm, useNotify, TextInput } from 'react-admin';
import { Button, Toolbar } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { httpClientWithRefresh } from '../httpClients';
import api from '../api';
import useAutoLogout from '../hooks/useAutoLogout';

const ChangePasswordView = () => {
    useAutoLogout();

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const dataProvided = () => (oldPassword && newPassword && confirmPassword);
    const passwordsMatch = () => (newPassword === confirmPassword);
    const buttonDisabled = () => !(dataProvided() && passwordsMatch());
    const notify = useNotify();

    const changePassword = async () => {
        if (!buttonDisabled()) {
            const url = api.youthWorker.password;
            const body = JSON.stringify({
                oldPassword, newPassword
            });
            const options = {
                method: 'POST',
                body
            };
            await httpClientWithRefresh(url, options)
                .then(response => {
                    if (response.statusCode < 200 || response.statusCode >= 300) {
                        notify(response.message, "warning");
                    } else {
                        notify(response.message, "success");
                    }
                })
        }
    }

    const CustomToolbar = () => {
        return (
            <Toolbar>
                <Button variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<SaveIcon />}
                    onClick={changePassword}
                    disabled={buttonDisabled()}>
                    Tallenna
                </Button>
            </Toolbar>
        )
    }

    return (
        <SimpleForm variant="standard" margin="normal" toolbar={<CustomToolbar />} {...{ oldpass: null, newpass: null, confirmpass: null }} >
            <TextInput value={oldPassword} autoComplete="off" label="Vanha salasana" type="password" onChange={(e) => setOldPassword(e.target.value)} required source="oldpass"/>
            <TextInput value={newPassword} autoComplete="off" label="Uusi salasana" type="password" onChange={(e) => setNewPassword(e.target.value)} required source="newpass"/>
            <TextInput value={confirmPassword} autoComplete="off" label="Vahvista uusi salasana" type="password" onChange={(e) => setConfirmPassword(e.target.value)} required source="confirmpass"/>
        </SimpleForm>
    );
};

export default ChangePasswordView;
