const appUrl = process.env.REACT_APP_ENDPOINT

export default {
  junior: {
    create: `${appUrl}/junior/register`,
    edit: `${appUrl}/junior/edit`,
    list: `${appUrl}/junior/list`,
    base: `${appUrl}/junior/`
  },
  auth: {
    login: `${appUrl}/admin/login`
  },
  youthClub: {
    list: `${appUrl}/club/list`,
    checkIn: `${appUrl}/club/check-in`
  },
  youthWorker: {
    create: `${appUrl}/admin/register`,
    edit: `${appUrl}/admin/edit`,
    list: `${appUrl}/admin/list`,
    self: `${appUrl}/admin/getSelf`,
    base: `${appUrl}/admin/`,
    refresh: `${appUrl}/admin/refresh`
  }
}
