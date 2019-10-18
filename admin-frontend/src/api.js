const base = process.env.REACT_APP_ENDPOINT

export default {
  junior: {
    create: `${base}/junior/register`,
    edit: `${base}/junior/edit`,
    list: `${base}/junior/list`
  },
  auth: {
    login: `${base}/admin/login`
  }
}