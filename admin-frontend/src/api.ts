const api = '/api';

const apiEndpoints = {
  junior: {
    base: `${api}/junior/`,
    create: `${api}/junior/register`,
    edit: `${api}/junior/edit`,
    list: `${api}/junior/list`,
    loginLink: `${api}/junior/loginLinkByAdmin`,
    dummynumber: `${api}/junior/nextAvailableDummyPhoneNumber`,
    newSeason: `${api}/junior/newSeason`,
    newSeasonSMSCount: `${api}/junior/newSeason/SMSCount`,
    deleteExpired:`${api}/junior/newSeason/deleteExpired`
  },
  auth: {
    login: `${api}/youthworker/login`,
    loginEntraID: `${api}/youthworker/loginEntraID`,
    logout: `${api}/youthworker/logout`,
    autologout: `${api}/youthworker/autologout`,
  },
  announcement: {
    create: `${api}/announcement/create`,
    dryRun: `${api}/announcement/dryrun`
  },
  extraEntry: {
    base: `${api}/extraEntry/`,
    list: `${api}/extraEntry/list`,
    create: `${api}/extraEntry/create`,
    delete: `${api}/extraEntry/delete`,
    deletePermit: `${api}/extraEntry/deletePermit`,
    type: `${api}/extraEntry/type/`,
    typeList: `${api}/extraEntry/type/list`,
    typeCreate: `${api}/extraEntry/type/create`
  },
  youthClub: {
    base: `${api}/club/`,
    list: `${api}/club/list`,
    edit: `${api}/club/edit`,
    checkIn: `${api}/club/checkIn`,
    checkInStats: `${api}/club/checkInStats`,
    checkInLog: `${api}/club/checkInLog`
  },
  youthWorker: {
    create: `${api}/youthworker/register`,
    edit: `${api}/youthworker/edit`,
    list: `${api}/youthworker/list`,
    self: `${api}/youthworker/getSelf`,
    refresh: `${api}/youthworker/refresh`,
    password: `${api}/youthworker/changePassword`,
    base: `${api}/youthworker/`,
    setMainYouthClub: `${api}/youthworker/setMainYouthClub`
  },
  event: {
    base: `${api}/event/`,
    list: `${api}/event/list`,
    edit: `${api}/event/edit`,
    create: `${api}/event/create`,
    delete: `${api}/event/delete`,
    checkIn: `${api}/event/checkIn`,
    checkInWithCode: `${api}/event/checkInwithCode`,
    checkInLog: `${api}/event/checkInLog`
  },
  spamGuard: {
    reset:`${api}/spamguard/reset`,
    getSecurityCode:`${api}/spamguard/getSecurityCode`
  },
  kompassi: {
    reset:`${api}/kompassi/reset`,
  }
}

export default apiEndpoints
