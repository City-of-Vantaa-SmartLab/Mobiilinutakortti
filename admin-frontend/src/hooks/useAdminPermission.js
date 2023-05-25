import { useEffect, useState } from 'react';
import { AUTH_GET_PERMISSIONS } from 'react-admin';
import { authProvider } from '../providers';

const useAdminPermission = () => {
  const [isAdmin, setstate] = useState(false);

  const getPermissions = async () => {
    const permissions = await authProvider(AUTH_GET_PERMISSIONS);
    setstate(permissions === 'ADMIN');
  };

  useEffect(() => {
    getPermissions();
  });

  return {
    isAdmin,
  };
};

export default useAdminPermission;
