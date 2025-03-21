const apiUrl = process.env.REACT_APP_API_URL || '/api';

const apiEndpoints = {
  junior: {
    create: `${apiUrl}/junior/register`,
    edit: `${apiUrl}/junior/edit`,
    list: `${apiUrl}/junior/list`,
    reset: `${apiUrl}/junior/reset`,
    base: `${apiUrl}/junior/`,
    dummynumber: `${apiUrl}/junior/nextAvailableDummyPhoneNumber`,
    newSeason: `${apiUrl}/junior/newSeason`,
    newSeasonSMSCount: `${apiUrl}/junior/newSeason/SMSCount`,
    deleteExpired:`${apiUrl}/junior/newSeason/deleteExpired`
  },
  auth: {
    login: `${apiUrl}/youthworker/login`,
    loginEntraID: `${apiUrl}/youthworker/loginEntraID`,
    logout: `${apiUrl}/youthworker/logout`,
    autologout: `${apiUrl}/youthworker/autologout`,
  },
  announcement: {
    create: `${apiUrl}/announcement/create`,
    dryRun: `${apiUrl}/announcement/dryrun`
  },
  extraEntry: {
    base: `${apiUrl}/extraEntry/`,
    list: `${apiUrl}/extraEntry/list`,
    create: `${apiUrl}/extraEntry/create`,
    delete: `${apiUrl}/extraEntry/delete`,
    deletePermit: `${apiUrl}/extraEntry/deletepermit`,
    type: `${apiUrl}/extraEntry/type/`,
    typeList: `${apiUrl}/extraEntry/type/list`,
    typeCreate: `${apiUrl}/extraEntry/type/create`
  },
  youthClub: {
    base: `${apiUrl}/club/`,
    list: `${apiUrl}/club/list`,
    edit: `${apiUrl}/club/edit`,
    checkIn: `${apiUrl}/club/checkIn`,
    checkInStats: `${apiUrl}/club/checkInStats`,
    checkInLog: `${apiUrl}/club/checkInLog`
  },
  youthWorker: {
    create: `${apiUrl}/youthworker/register`,
    edit: `${apiUrl}/youthworker/edit`,
    list: `${apiUrl}/youthworker/list`,
    self: `${apiUrl}/youthworker/getSelf`,
    refresh: `${apiUrl}/youthworker/refresh`,
    password: `${apiUrl}/youthworker/changePassword`,
    base: `${apiUrl}/youthworker/`,
    setMainYouthClub: `${apiUrl}/youthworker/setMainYouthClub`
  },
  spamGuard: {
    reset:`${apiUrl}/spamguard/reset`,
    getSecurityCode:`${apiUrl}/spamguard/getSecurityCode`
  }
}

export default apiEndpoints
