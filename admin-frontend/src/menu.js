import React from 'react';
import { MenuItemLink } from 'react-admin';
import styled from 'styled-components';
import ChildCareIcon from '@material-ui/icons/ChildCare';
import NewSeasonIcon from '@material-ui/icons/Autorenew';
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks';
import LibraryAddIcon from '@material-ui/icons/LibraryAdd';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import EditLocationIcon from '@material-ui/icons/EditLocation';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications';
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
        leftIcon={<LocationOnIcon />}
      />
      {isAdmin &&
        <MenuItemLink
          to="/editYouthClubs"
          primaryText="Nuorisotilojen muokkaus"
          leftIcon={<EditLocationIcon />}
        />
      }
      {isAdmin &&
        <MenuItemLink
          to="/youthWorker"
          primaryText="Nuorisotyöntekijät"
          leftIcon={<SupervisorAccountIcon />}
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
        leftIcon={<LibraryAddIcon />}
      />}
      {(showExtraEntries && isAdmin) && <MenuItemLink
          to="/extraEntryType"
          primaryText="Merkintätyypit"
          leftIcon={<LibraryBooksIcon />}
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
      {isAdmin && <MenuItemLink
          to="/miscFunctions"
          primaryText="Muut toiminnot"
          leftIcon={<SettingsApplicationsIcon />}
        />
      }
    </MenuContainer>
  );
};

export default Menu;
