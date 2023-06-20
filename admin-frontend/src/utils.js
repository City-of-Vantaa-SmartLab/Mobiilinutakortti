import { GET_LIST } from 'react-admin';
import { dataProvider } from './providers/dataProvider';

export const genderChoices = [
  { id: 'm', name: 'Mies' },
  { id: 'f', name: 'Nainen' },
  { id: 'o', name: 'Muu' },
  { id: '-', name: 'Ei halua määritellä'}
];

export const statusChoices = [
  { id: 'accepted', name: 'Kotisoitto tehty' },
  { id: 'pending', name: 'Kotisoitto tekemättä' },
  { id: 'expired', name:  'Tunnus vanhentunut' },
  { id: 'failedCall', name: 'Kotisoittoa yritetty' }
];

export const recipientChoicesForSms = [
  { id: 'parents', name: 'Vanhemmat' },
  { id: 'juniors', name: 'Nuoret'  },
];

export const messageTypeChoices = [
  { id: 'sms', name: 'Tekstiviesti' },
  { id: 'email', name: 'Sähköposti' },
];

export const userToken = 'user-token';

export const parseErrorMessages = (messageList) => {
  if (Array.isArray(messageList) && messageList.every((elem) => elem.hasOwnProperty('constraints'))) {
    return messageList.map(errorObj => Object.values(errorObj.constraints)[0]).join('\n')
  } else {
    return messageList;
  }
}

export const ageValidator = (value, allValues) => {
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

export const getYouthClubs = () => dataProvider(GET_LIST, 'youthClub')
  .then((res) => res.data.map((youthClub) => ({ id: youthClub.id.toString(), name: youthClub.name, active: youthClub.active})));

export const getActiveYouthClubs = () => dataProvider(GET_LIST, 'youthClub')
  .then((res) => res.data.map((youthClub) => {
        return youthClub.active ? { id: youthClub.id.toString(), name: youthClub.name } : null;
  }
));

export const isSubstring = (mainString, subString) => mainString.includes(subString);
