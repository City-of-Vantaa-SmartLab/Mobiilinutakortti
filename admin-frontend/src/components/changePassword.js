import React, { useState } from 'react';
import { SimpleForm, showNotification } from 'react-admin';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { TextField, Button, Toolbar } from '@material-ui/core';
import SaveIcon from '@material-ui/icons/Save';
import { httpClientWithResponse } from '../httpClients';
import api from '../api';

let ChangePasswordView = (props) => {

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const changePassword = async () => {
        if (oldPassword !== '' && newPassword !== '') {
            const url = api.youthWorker.password;
            const body = JSON.stringify({
                oldPassword, newPassword
            });
            const options = {
                method: 'POST',
                body
            };
            await httpClientWithResponse(url, options)
                .then(response => {
                    const { showNotification } = props;
                    if (response.statusCode < 200 || response.statusCode >= 300) {
                        showNotification(response.message, "warning");
                    } else {
                        showNotification(response.message, "success");
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
                    onClick={changePassword}>
                    Tallenna
                </Button>
            </Toolbar>
        )
    }

    return (
        <SimpleForm toolbar={<CustomToolbar />} >
            <TextField value={oldPassword} label="Vanha Salasana" type="password" onChange={(e) => setOldPassword(e.target.value)} required />
            <TextField value={newPassword} label="Uusi Salasana" type="password" onChange={(e) => setNewPassword(e.target.value)} required />
        </SimpleForm>
    );
};

ChangePasswordView = reduxForm({
    form: 'changePasswordView'
})(ChangePasswordView);

ChangePasswordView = connect(null, { showNotification })(ChangePasswordView);

export default ChangePasswordView;