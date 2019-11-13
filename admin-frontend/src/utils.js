import { GET_LIST } from 'react-admin';
import { dataProvider } from './providers/dataProvider';

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
    return 'Invalid date entered.';
  }

  const current = new Date().getTime();

  if (current < valueAsTimestamp) {
    return 'Junior cannot be born in the future.';
  }
  return undefined;
}

export const getYouthClubs = () => dataProvider(GET_LIST, 'youthClub')
  .then((res) => res.data.map((youthClub) => ({ id: youthClub.name, name: youthClub.name }))) // TODO: Eventually it will be wise to change the ID to the actual ID. This will require backend changes.)

