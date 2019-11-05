export const parseErrorMessages = (messageList) => {
  if (Array.isArray(messageList) && messageList.every((elem) => elem.hasOwnProperty('constraints'))) {
    return messageList.map(errorObj => Object.values(errorObj.constraints)[0]).join('\n')
  } else {
    return messageList;
  }
}

export const timestampToDate = (timestamp) => new Date(+timestamp);

export const ageValidator = (value, allValues) => {
  const valueAsTimestring = new Date(+value).getTime();
  const current = new Date().getTime();
  if (current < valueAsTimestring) {
    return 'Junior cannot be born in the future.';
  }
}