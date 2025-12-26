import { MenuItemLink } from 'react-admin';
import styled from 'styled-components';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import NewSeasonIcon from '@mui/icons-material/Autorenew';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import EditLocationIcon from '@mui/icons-material/EditLocation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import useAdminPermission from './hooks/useAdminPermission';

const MenuContainer = styled.div`
  margin-top: 1.5em;
`;

const Menu = () => {
  const { isAdmin, isSignedIn } = useAdminPermission();
  const showExtraEntries = import.meta.env.VITE_ENABLE_EXTRA_ENTRIES;

  return !isSignedIn ? null : (
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
