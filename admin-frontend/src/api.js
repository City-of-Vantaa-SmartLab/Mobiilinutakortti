const base = process.env.REACT_APP_ENDPOINT

export default {
  adminLogin: `${base}/admin/login`,
  juniorCreate: `${base}/junior/register`,
  juniorEdit: `${base}/junior/edit`,
  juniorList: `${base}/junior/list`
}