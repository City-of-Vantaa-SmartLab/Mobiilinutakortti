export const parseErrorMessages = (messageList) => {
  if (Array.isArray(messageList) && messageList.every((elem) => elem.hasOwnProperty('constraints'))) {
    return messageList.map(errorObj => Object.values(errorObj.constraints)[0]).join('\n')
  } else {
    return messageList;
  }
}
