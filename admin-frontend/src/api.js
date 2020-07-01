const appUrl = process.env.REACT_APP_ENDPOINT

export default {
  junior: {
    create: `${appUrl}/junior/register`,
    edit: `${appUrl}/junior/edit`,
    list: `${appUrl}/junior/list`,
    total: `${appUrl}/junior/total`,
    reset: `${appUrl}/junior/reset`,
    base: `${appUrl}/junior/`,
    dummynumber: `${appUrl}/junior/nextAvailableDummyPhoneNumber`,
  },
  auth: {
    login: `${appUrl}/admin/login`
  },
  youthClub: {
    list: `${appUrl}/club/list`,
    checkIn: `${appUrl}/club/check-in`,
    logBook: `${appUrl}/club/logbook`,
    checkIns: `${appUrl}/club/check-ins`
  },
  youthWorker: {
    create: `${appUrl}/admin/register`,
    edit: `${appUrl}/admin/edit`,
    list: `${appUrl}/admin/list`,
    self: `${appUrl}/admin/getSelf`,
    refresh: `${appUrl}/admin/refresh`,
    password: `${appUrl}/admin/changePassword`,
    base: `${appUrl}/admin/`
  }
}
