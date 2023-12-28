import React from 'react';
import { Layout, AppBar, UserMenu, MenuItemLink, Notification } from 'react-admin';
import LockIcon from '@material-ui/icons/Lock';
import styled from 'styled-components';
import Menu from './menu';

const CustomUserMenu = props => (
    <UserMenu {...props}>
        {!process.env.REACT_APP_ENTRA_TENANT_ID ? (
            <MenuItemLink
                to="/password"
                primaryText="Salasana"
                leftIcon={<LockIcon />}
            />) : null}
    </UserMenu>
);
const CustomNotification = styled(Notification)`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.3rem !important;
    font-weight: 400 !important;
    line-height: 1.33 !important;
    letter-spacing: 0em !important;
    padding-bottom: 20px !important;
    padding-top: 20px !important;
`

const CustomAppBar = props => <AppBar {...props} userMenu={<CustomUserMenu />} />;

const CustomLayout = props => <Layout {...props} appBar={CustomAppBar} notification={CustomNotification} menu={Menu} />;

export default CustomLayout;
