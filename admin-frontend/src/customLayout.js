import React from 'react';
import { Layout, AppBar, UserMenu, MenuItemLink } from 'react-admin';
import LockIcon from '@material-ui/icons/Lock';

const CustomUserMenu = props => (
    <UserMenu {...props}>
        <MenuItemLink
            to="/password"
            primaryText="Salasana"
            leftIcon={<LockIcon />}
        />
    </UserMenu>
);


const CustomAppBar = props => <AppBar {...props} userMenu={<CustomUserMenu />} />;

const CustomLayout = props => <Layout {...props} appBar={CustomAppBar} />;

export default CustomLayout;