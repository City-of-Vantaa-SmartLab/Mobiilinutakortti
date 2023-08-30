const appUrl = process.env.REACT_APP_ENDPOINT

const apiEndpoints = {
  junior: {
    create: `${appUrl}/junior/register`,
    edit: `${appUrl}/junior/edit`,
    list: `${appUrl}/junior/list`,
    reset: `${appUrl}/junior/reset`,
    base: `${appUrl}/junior/`,
    dummynumber: `${appUrl}/junior/nextAvailableDummyPhoneNumber`,
    newSeason: `${appUrl}/junior/newSeason`,
    newSeasonSMSCount: `${appUrl}/junior/newSeason/SMSCount`,
    deleteExpired:`${appUrl}/junior/newSeason/deleteExpired`
  },
  auth: {
    login: `${appUrl}/youthworker/login`,
    logout: `${appUrl}/youthworker/logout`,
  },
  announcement: {
    create: `${appUrl}/announcement/create`,
    dryRun: `${appUrl}/announcement/dryrun`
  },
  extraEntry: {
    base: `${appUrl}/extraEntry/`,
    list: `${appUrl}/extraEntry/list`,
    create: `${appUrl}/extraEntry/create`,
    delete: `${appUrl}/extraEntry/delete`,
    deletePermit: `${appUrl}/extraEntry/deletepermit`,
    type: `${appUrl}/extraEntry/type/`,
    typeList: `${appUrl}/extraEntry/type/list`,
    typeCreate: `${appUrl}/extraEntry/type/create`
  },
  youthClub: {
    base: `${appUrl}/club/`,
    list: `${appUrl}/club/list`,
    edit: `${appUrl}/club/edit`,
    checkIn: `${appUrl}/club/check-in`,
    logBook: `${appUrl}/club/logbook`,
    checkIns: `${appUrl}/club/check-ins`
  },
  youthWorker: {
    create: `${appUrl}/youthworker/register`,
    edit: `${appUrl}/youthworker/edit`,
    list: `${appUrl}/youthworker/list`,
    self: `${appUrl}/youthworker/getSelf`,
    refresh: `${appUrl}/youthworker/refresh`,
    password: `${appUrl}/youthworker/changePassword`,
    base: `${appUrl}/youthworker/`
  }
}

export default apiEndpoints
