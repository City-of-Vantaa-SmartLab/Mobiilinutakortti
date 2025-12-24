import { GET_LIST, HttpError } from 'react-admin';
import { dataProvider } from './providers/dataProvider';
import { Container } from '@mui/material';

// This should match the backend's middleware's admin route.
export const adminUiBasePath = '/nuorisotyontekijat';
export const loginFragment = '#/login';
export const hrefFragmentToJunior = (id?: string) => { return `#/junior/${id ?? ''}` };
export const hrefFragmentToExtraEntry = (id: string) => { return `#/extraEntry/${id ?? ''}` };

export const genderChoices = [
  { id: 'm', name: 'Poika' },
  { id: 'f', name: 'Tyttö' },
  { id: 'o', name: 'Muu' },
  { id: '-', name: 'Ei halua määritellä'}
];

export const Status = Object.freeze({
  accepted: 'accepted',
  pending: 'pending',
  expired: 'expired',
  failedCall: 'failedCall',
  extraEntriesOnly: 'extraEntriesOnly'
});

export const statusChoices = [
  { id: Status.accepted, name: 'Kotisoitto tehty' },
  { id: Status.pending, name: 'Kotisoitto tekemättä' },
  { id: Status.expired, name: 'Tunnus vanhentunut' },
  { id: Status.failedCall, name: 'Kotisoittoa yritetty' },
  ...( import.meta.env.VITE_ENABLE_EXTRA_ENTRIES ?
    [ { id: Status.extraEntriesOnly, name: 'Vain merkintärekisteri' } ] :
    []
  )
];

export const recipientChoicesForSms = [
  { id: 'parents', name: 'Vanhemmat' },
  { id: 'juniors', name: 'Nuoret'  },
];

export const messageTypeChoices = [
  { id: 'sms', name: 'Tekstiviesti' },
  { id: 'email', name: 'Sähköposti' },
];

export const checkInClubIdKey = 'checkInClubId';
export const checkInSecurityCodeKey = 'checkInSecurityCode';
export const userTokenKey = 'user-token';
export const MSALAppLogoutInProgressKey = 'MSALAppLogoutInProgress';

export const newHttpErrorFromResponse = (response: any) => {
  let msg = '';
  if (Array.isArray(response.message) && response.message.every((elem: any) => elem.hasOwnProperty('constraints'))) {
    msg = response.message.map((errorObj: any) => Object.values(errorObj.constraints)[0]).join('\n')
  } else {
    msg = response.message;
  }
  return new HttpError(msg, response.statusCode);
}

export const ageValidator = (value: any, _: any) => {
  const valueAsTimestamp = Date.parse(value.toString());

  if (isNaN(valueAsTimestamp)) {
    return 'Väärä päivämäärä.';
  }

  const current = new Date().getTime();

  if (current < valueAsTimestamp) {
    return 'Syntymäpäivä ei voi olla tulevaisuudessa.';
  }
  return undefined;
}

export const getYouthClubOptions = async () => dataProvider(GET_LIST, 'youthClub', {
  pagination: { page: 1, perPage: 1000 },
  sort: { field: 'id', order: 'ASC' },
  filter: {},
})
  .then((res: any) => res.data.map((youthClub: any) => ({ id: youthClub.id, name: youthClub.name, active: youthClub.active})));

export const getActiveYouthClubOptions = async () => {
  return (await getYouthClubOptions()).filter((club: any) => club.active);
}

export const isSubstring = (mainString: string, subString: string) => mainString.includes(subString);

export const getEntryTypes = () => dataProvider(GET_LIST, 'extraEntryType', {
  pagination: { page: 1, perPage: 1000 },
  sort: { field: 'id', order: 'ASC' },
  filter: {},
}).then((response: any) => response.data);

export const setUserInfo = (userInfo: any) => {
  if (!userInfo || !userInfo.firstName) {
    console.error("No user info to set.");
    return;
  }

  sessionStorage.setItem('userInfo', JSON.stringify({
    firstName: userInfo.firstName,
    mainYouthClubId: userInfo.mainYouthClub || -1,
    passwordLastChanged: userInfo.passwordLastChanged
  }));

  if (userInfo.isAdmin) {
    sessionStorage.setItem('role', 'ADMIN');
  } else {
    sessionStorage.setItem('role', 'YOUTHWORKER');
  }
}

export const getUserInfo = () => {
  return JSON.parse(sessionStorage.getItem('userInfo')!);
}

export const clearUserInfo = () => {
  sessionStorage.removeItem('userInfo');
}

// When using a common alert dialog, create an observer for it and fix the dialog title when dialog appears.
export const getAlertDialogObserver = (newDialogTitle: any) => {
  const targetNode = document;
  const config = { attributes: true, childList: false, subtree: true };

  const checkTitles = () => {
    const title = document.getElementById('alert-dialog-title');
    if (title) {
      const h2 = title.getElementsByTagName("h2")[0];
      if (h2) {
        h2.innerHTML = newDialogTitle;
      }
    }
  };
  const observer = new MutationObserver(checkTitles);
  observer.observe(targetNode, config);

  return observer;
}

// Removes basePath from DOM elements to show notes inside forms without console errors.
export const NoBasePath = ({basePath, ...props}: {basePath?: any, [key: string]: any}) => (
  <Container {...props} style={{'marginLeft': '0px', 'marginRight': '0px', 'paddingLeft': '0px', 'paddingRight': '0px', 'width': '100%'}}/>
);

// How many minutes to wait for inactivity before auto logout functions trigger.
// This should be kept more or less the same as youthWorkerExpiry authentication const in backend.
export const autoLogoutTimeoutMinutes = 15;
