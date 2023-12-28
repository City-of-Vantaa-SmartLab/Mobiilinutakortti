import { useEffect, useState } from 'react';
import { AUTH_GET_PERMISSIONS } from 'react-admin';
import { authProvider } from '../providers';

const useAdminPermission = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  const getPermissions = async () => {
    try {
      const permissions = await authProvider(AUTH_GET_PERMISSIONS);
      setIsAdmin(permissions === 'ADMIN');
    } catch {
      // It's fine if there's no permission info yet (user hasn't logged in).
    }
  };

  useEffect(() => {
    getPermissions();
  });

  return {
    isAdmin,
  };
};

export default useAdminPermission;
