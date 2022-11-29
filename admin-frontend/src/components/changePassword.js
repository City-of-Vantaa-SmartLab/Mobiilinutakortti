import React, { useState } from 'react';
import { SimpleForm, useNotify } from 'react-admin';
import { TextField, Button, Toolbar } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import { httpClientWithRefresh } from '../httpClients';
import api from '../api';

let ChangePasswordView = () => {
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
        <SimpleForm variant="standard" margin="normal" toolbar={<CustomToolbar />} >
            <TextField value={oldPassword} label="Vanha Salasana" type="password" onChange={(e) => setOldPassword(e.target.value)} required />
            <TextField value={newPassword} label="Uusi Salasana" type="password" onChange={(e) => setNewPassword(e.target.value)} required />
            <TextField value={confirmPassword} label="Vahvista uusi salasana" type="password" onChange={(e) => setConfirmPassword(e.target.value)} required />
        </SimpleForm>
    );
};

export default ChangePasswordView;