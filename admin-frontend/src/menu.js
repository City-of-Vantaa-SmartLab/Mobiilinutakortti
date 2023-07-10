import React from 'react';
import { MenuItemLink } from 'react-admin';
import styled from 'styled-components';
import ChildCareIcon from '@material-ui/icons/ChildCare';
import CreateIcon from '@material-ui/icons/Create';
import ListIcon from '@material-ui/icons/ViewList';
import NewSeasonIcon from '@material-ui/icons/Autorenew';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import useAdminPermission from './hooks/useAdminPermission';

const MenuContainer = styled.div`
  margin-top: 1.5em;
`;

const Menu = () => {
  const { isAdmin } = useAdminPermission();
  const showExtraEntries = process.env.REACT_APP_ENABLE_EXTRA_ENTRIES;

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
      {isAdmin &&
        <MenuItemLink
          to="/editYouthClubs"
          primaryText="Nuorisotilojen muokkaus"
          leftIcon={<ListIcon />}
        />
      }
      {isAdmin &&
        <MenuItemLink
          to="/youthWorker"
          primaryText="Nuorisotyöntekijät"
          leftIcon={<ListIcon />}
        />
      }
      {isAdmin && <MenuItemLink
          to="/announcement/create"
          primaryText="Tiedotus"
          leftIcon={<MailOutlineIcon />}
        />
      }
      {showExtraEntries && <MenuItemLink
        to="/extraEntry"
        primaryText="Lisämerkinnät"
        leftIcon={<CreateIcon />}
      />}
      {(showExtraEntries && isAdmin) && <MenuItemLink
          to="/extraEntryType"
          primaryText="Merkintätyypit"
          leftIcon={<CreateIcon />}
        />
      }
      {isAdmin && <MenuItemLink
          to="/newSeason"
          primaryText="Aloita uusi kausi"
          leftIcon={<NewSeasonIcon />}
        />
      }
      {isAdmin && <MenuItemLink
          to="/deleteExpiredJuniors"
          primaryText="Poista vanhat käyttäjät"
          leftIcon={<DeleteIcon />}
        />
      }
    </MenuContainer>
  );
};

export default Menu;
