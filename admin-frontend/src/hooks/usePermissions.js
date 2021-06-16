import { useEffect, useState } from 'react';
import { AUTH_GET_PERMISSIONS } from 'react-admin';
import { authProvider } from '../providers';

const usePermissions = () => {
  const [isSuperAdmin, setstate] = useState(false);

  const getPermissions = async () => {
    const permissions = await authProvider(AUTH_GET_PERMISSIONS);
    setstate(permissions === 'SUPERADMIN');
  };

  useEffect(() => {
    getPermissions();
  });

  return {
    isSuperAdmin,
  };
};

export default usePermissions;
