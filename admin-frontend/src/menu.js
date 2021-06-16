import React from 'react';
import { MenuItemLink } from 'react-admin';
import styled from 'styled-components';
import ChildCareIcon from '@material-ui/icons/ChildCare';
import ListIcon from '@material-ui/icons/ViewList';
import NewSeasonIcon from '@material-ui/icons/Autorenew';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import usePermissions from './hooks/usePermissions';

const MenuContainer = styled.div`
  margin-top: 1.5em;
`;

const Menu = () => {
  const { isSuperAdmin } = usePermissions();

  return (
    <MenuContainer>
      <MenuItemLink
        to="/junior"
        primaryText="Nuoret"
        leftIcon={<ChildCareIcon />}
      />
      <MenuItemLink
        to="/youthClub"
        primaryText="Nuorisotilat"
        leftIcon={<ListIcon />}
      />
      {isSuperAdmin && (
        <React.Fragment>
          <MenuItemLink
            to="/youthWorker"
            primaryText="Nuorisotyöntekijät"
            leftIcon={<ListIcon />}
          />
          <MenuItemLink
            to="/newSeason"
            primaryText="Aloita uusi kausi"
            leftIcon={<NewSeasonIcon />}
          />
          <MenuItemLink
            to="/deleteExpiredUsers"
            primaryText="Poista vanhat käyttäjät"
            leftIcon={<DeleteIcon />}
          />
        </React.Fragment>
      )}
    </MenuContainer>
  );
};

export default Menu;
