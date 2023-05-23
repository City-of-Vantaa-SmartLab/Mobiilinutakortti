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
    deleteExpiredUsers:`${appUrl}/junior/newSeason/clearExpired`
  },
  auth: {
    login: `${appUrl}/youthworker/login`,
    logout: `${appUrl}/youthworker/logout`,
  },
  youthClub: {
    base: `${appUrl}/club/`,
    list: `${appUrl}/club/list/`,
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
