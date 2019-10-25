const base = process.env.REACT_APP_ENDPOINT

export default {
  junior: {
    create: `${base}/junior/register`,
    edit: `${base}/junior/edit`,
    list: `${base}/junior/list`,
    base: `${base}/junior/`
  },
  auth: {
    login: `${base}/admin/login`
  }
}